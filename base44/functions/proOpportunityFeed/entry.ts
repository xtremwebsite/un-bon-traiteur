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
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 });
    const profiles = await base44.asServiceRole.entities.CatererProfile.filter({ created_by_id: user.id }, '-created_date', 1);
    const profile = profiles[0];
    if (user.role !== 'admin' && !profile) return Response.json({ error: 'Accès réservé aux professionnels' }, { status: 403 });
    const subscribed = user.role === 'admin' || (['active', 'trialing'].includes(user.subscription_status) && ['bronze', 'argent', 'or'].includes(user.subscription_plan));
    const [quotes, urgent] = await Promise.all([base44.asServiceRole.entities.QuoteRequest.list('-created_date', 300), base44.asServiceRole.entities.UrgentRequest.list('-created_date', 300)]);
    const source = [...quotes.filter(item => !['closed', 'cancelled'].includes(item.status)).map(item => ({ ...item, kind: 'quote' })), ...urgent.filter(item => item.transmission_consent && !['fulfilled', 'expired', 'cancelled', 'rejected'].includes(item.status)).map(item => ({ ...item, kind: 'urgent' }))];
    const locations = [...new Set(source.filter(item => !Number.isFinite(item.latitude) || !Number.isFinite(item.longitude)).map(item => item.location))];
    const resolved = new Map(await Promise.all(locations.map(async location => [location, await geocode(location)])));
    const items = source.map(item => {
      const point = Number.isFinite(item.latitude) && Number.isFinite(item.longitude) ? { latitude: item.latitude, longitude: item.longitude } : resolved.get(item.location);
      if (!point) return null;
      const summary = { id: item.id, kind: item.kind, reference: item.reference, event_type: item.event_type, event_date: item.event_date, guest_count: item.guest_count, location: item.location, budget: item.budget, format: item.format, status: item.status, ...point };
      return subscribed ? { ...summary, message: item.message, service_need: item.service_need, first_name: item.first_name, last_name: item.last_name, email: item.email, phone: item.phone } : summary;
    }).filter(Boolean);
    return Response.json({ items, subscribed, profile: profile ? { business_name: profile.business_name, latitude: profile.latitude, longitude: profile.longitude, service_radius_km: profile.service_radius_km } : null });
  } catch (error) {
    console.error('proOpportunityFeed', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}