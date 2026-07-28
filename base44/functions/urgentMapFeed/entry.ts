import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

async function geocode(location) {
  const response = await fetch(`https://api-adresse.data.gouv.fr/search/?limit=1&q=${encodeURIComponent(location)}`);
  if (!response.ok) return null;
  const data = await response.json();
  const coordinates = data.features?.[0]?.geometry?.coordinates;
  return coordinates ? { longitude: coordinates[0], latitude: coordinates[1] } : null;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch { user = null; }
    const subscribed = user?.role === 'admin' || (['active', 'trialing'].includes(user?.subscription_status) && ['bronze', 'argent', 'or'].includes(user?.subscription_plan));
    const records = await base44.asServiceRole.entities.UrgentRequest.list('-created_date', 200);
    const active = records.filter(item => item.transmission_consent && !['fulfilled', 'expired', 'cancelled', 'rejected'].includes(item.status));
    const locations = [...new Set(active.filter(item => !Number.isFinite(item.latitude) || !Number.isFinite(item.longitude)).map(item => item.location))];
    const resolved = new Map(await Promise.all(locations.map(async location => [location, await geocode(location)])));
    const items = active.map(item => {
      const point = Number.isFinite(item.latitude) && Number.isFinite(item.longitude) ? { latitude: item.latitude, longitude: item.longitude } : resolved.get(item.location);
      if (!point) return null;
      const summary = { id: item.id, event_type: item.event_type, event_date: item.event_date, guest_count: item.guest_count, location: item.location, ...point };
      return subscribed ? { ...summary, message: item.message, service_need: item.service_need, first_name: item.first_name, email: item.email, phone: item.phone } : summary;
    }).filter(Boolean);
    return Response.json({ items, subscribed });
  } catch (error) {
    console.error('urgentMapFeed', error);
    return Response.json({ error: 'Impossible de charger les urgences' }, { status: 500 });
  }
}