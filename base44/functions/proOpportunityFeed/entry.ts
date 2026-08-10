import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { distanceKm, geocodeLocation } from '../../shared/geolocation.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const profiles = await base44.asServiceRole.entities.CatererProfile.filter({ created_by_id: user.id }, '-created_date', 1);
    let profile = profiles[0];
    if (user.role !== 'admin' && !profile) return Response.json({ error: 'Accès réservé aux professionnels' }, { status: 403 });
    if (profile && (!Number.isFinite(profile.latitude) || !Number.isFinite(profile.longitude))) {
      const point = await geocodeLocation([profile.address, profile.postal_code, profile.city].filter(Boolean).join(', '));
      if (point) profile = await base44.asServiceRole.entities.CatererProfile.update(profile.id, point);
    }
    const subscribed = user.role === 'admin' || (['active', 'trialing'].includes(user.subscription_status) && ['bronze', 'argent', 'or'].includes(user.subscription_plan));
    if (['view', 'respond'].includes(body.action)) {
      if (!['quote', 'urgent'].includes(body.kind)) return Response.json({ error: 'Type de demande invalide' }, { status: 400 });
      const entity = body.kind === 'quote' ? 'QuoteRequest' : 'UrgentRequest';
      const request = await base44.asServiceRole.entities[entity].get(String(body.request_id || ''));
      if (!request?.transmission_consent) return Response.json({ error: 'Demande introuvable' }, { status: 404 });
      if (request.caterer_id && request.caterer_id !== profile?.id && user.role !== 'admin') return Response.json({ error: 'Accès refusé' }, { status: 403 });
      const catererId = profile?.id || `admin:${user.id}`;
      if (body.action === 'view') {
        const viewed = await base44.asServiceRole.entities.OpportunityInteraction.filter({ request_id: request.id, request_kind: body.kind, caterer_id: catererId, interaction_type: 'view' }, '-created_date', 1);
        if (!viewed.length) await base44.entities.OpportunityInteraction.create({ request_id: request.id, request_kind: body.kind, caterer_id: catererId, interaction_type: 'view' });
      } else {
        if (!subscribed) return Response.json({ error: 'Un abonnement actif est nécessaire pour répondre.' }, { status: 403 });
        const message = String(body.message || '').trim().slice(0, 2000);
        if (message.length < 10) return Response.json({ error: 'Votre réponse doit contenir au moins 10 caractères.' }, { status: 400 });
        const interaction = await base44.entities.OpportunityInteraction.create({ request_id: request.id, request_kind: body.kind, caterer_id: catererId, interaction_type: 'response', message });
        try {
          await base44.functions.invoke('sendN8nWebhook', { entity_name: entity, entity_id: request.id, event_name: 'opportunity_response_sent', delivery_key: interaction.id, context: { recipient_email: request.email || '', recipient_name: request.first_name || '', caterer_name: profile?.business_name || '', caterer_email: profile?.email || user.email || '', message, request_kind: body.kind, reference: request.reference || '' } });
        } catch (notificationError) { console.error('proOpportunityFeed n8n notification', notificationError); }
      }
      const interactions = await base44.asServiceRole.entities.OpportunityInteraction.filter({ request_id: request.id, request_kind: body.kind }, '-created_date', 1000);
      return Response.json({ view_count: interactions.filter(item => item.interaction_type === 'view').length, response_count: interactions.filter(item => item.interaction_type === 'response').length });
    }
    const [quotes, urgent, interactions] = await Promise.all([base44.asServiceRole.entities.QuoteRequest.list('-created_date', 300), base44.asServiceRole.entities.UrgentRequest.list('-created_date', 300), base44.asServiceRole.entities.OpportunityInteraction.list('-created_date', 2000)]);
    const source = [...quotes.filter(item => item.request_source === 'matching_service' && !item.caterer_id && item.transmission_consent && !['closed', 'cancelled'].includes(item.status)).map(item => ({ ...item, kind: 'quote' })), ...urgent.filter(item => item.transmission_consent && !['fulfilled', 'expired', 'cancelled', 'rejected'].includes(item.status)).map(item => ({ ...item, kind: 'urgent' }))];
    const locations = [...new Set(source.filter(item => !Number.isFinite(item.latitude) || !Number.isFinite(item.longitude)).map(item => item.location))];
    const resolved = new Map(await Promise.all(locations.map(async location => [location, await geocodeLocation(location)])));
    const items = source.map(item => {
      const point = Number.isFinite(item.latitude) && Number.isFinite(item.longitude) ? { latitude: item.latitude, longitude: item.longitude } : resolved.get(item.location);
      if (!point) return null;
      const requestInteractions = interactions.filter(interaction => interaction.request_id === item.id && interaction.request_kind === item.kind);
      const summary = { id: item.id, kind: item.kind, reference: item.reference, caterer_id: item.caterer_id, event_type: item.event_type, event_date: item.event_date, event_time: item.event_time, guest_count: item.guest_count, location: item.location, address: item.address, postal_code: item.postal_code, city: item.city, budget: item.budget, format: item.format, status: item.status, radius_km: item.radius_km, view_count: requestInteractions.filter(interaction => interaction.interaction_type === 'view').length, response_count: requestInteractions.filter(interaction => interaction.interaction_type === 'response').length, ...point };
      return subscribed ? { ...summary, message: item.message, service_need: item.service_need } : summary;
    }).filter(Boolean).filter(item => user.role === 'admin' || !Number.isFinite(profile?.latitude) || !Number.isFinite(profile?.longitude) || distanceKm(profile.latitude, profile.longitude, item.latitude, item.longitude) <= Math.min(Number(profile.service_radius_km || 50), Number(item.radius_km || 50)));
    return Response.json({ items, subscribed, profile: profile ? { business_name: profile.business_name, latitude: profile.latitude, longitude: profile.longitude, service_radius_km: profile.service_radius_km } : null });
  } catch (error) {
    console.error('proOpportunityFeed', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}