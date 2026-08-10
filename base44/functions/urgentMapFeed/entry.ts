import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geocodeLocation } from '../../shared/geolocation.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch { user = null; }
    const subscribed = user?.role === 'admin' || (['active', 'trialing'].includes(user?.subscription_status) && ['bronze', 'argent', 'or'].includes(user?.subscription_plan));
    const [urgentRecords, quoteRecords] = await Promise.all([base44.asServiceRole.entities.UrgentRequest.list('-created_date', 200), base44.asServiceRole.entities.QuoteRequest.list('-created_date', 200)]);
    const activeUrgent = urgentRecords.filter(item => item.transmission_consent && !['fulfilled', 'expired', 'cancelled', 'rejected'].includes(item.status));
    const activeQuotes = quoteRecords.filter(item => !item.caterer_id && item.transmission_consent && !['closed', 'cancelled'].includes(item.status));
    const active = [...activeUrgent, ...activeQuotes];
    const locations = [...new Set(active.filter(item => !Number.isFinite(item.latitude) || !Number.isFinite(item.longitude)).map(item => item.location))];
    const resolved = new Map(await Promise.all(locations.map(async location => [location, await geocodeLocation(location)])));
    const mapItem = item => {
      const point = Number.isFinite(item.latitude) && Number.isFinite(item.longitude) ? { latitude: item.latitude, longitude: item.longitude } : resolved.get(item.location);
      if (!point) return null;
      const summary = { id: item.id, reference: item.reference, event_type: item.event_type, event_date: item.event_date, guest_count: item.guest_count, location: item.location, budget: item.budget, ...point };
      return subscribed ? { ...summary, message: item.message, service_need: item.service_need } : summary;
    };
    return Response.json({ items: activeUrgent.map(mapItem).filter(Boolean), quotes: activeQuotes.map(mapItem).filter(Boolean), subscribed });
  } catch (error) {
    console.error('urgentMapFeed', error);
    return Response.json({ error: 'Impossible de charger les urgences' }, { status: 500 });
  }
}