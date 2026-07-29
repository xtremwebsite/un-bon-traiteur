import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

async function geocode(location) {
  const response = await fetch(`https://api-adresse.data.gouv.fr/search/?limit=1&q=${encodeURIComponent(location)}`);
  if (!response.ok) return {};
  const data = await response.json();
  const coordinates = data.features?.[0]?.geometry?.coordinates;
  return coordinates ? { longitude: coordinates[0], latitude: coordinates[1] } : {};
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    if (body.website) return Response.json({ ok: true });
    const kind = body.kind === 'urgent' ? 'urgent' : 'quote';
    const data = body.data || {};
    const required = kind === 'urgent' ? ['event_date', 'location', 'event_type', 'guest_count', 'email', 'phone'] : ['event_date', 'location', 'event_type', 'guest_count', 'first_name', 'email'];
    if (required.some(field => !data[field])) return Response.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    if (String(data.email).length > 160 || String(data.message || '').length > 3000) return Response.json({ error: 'Données trop longues' }, { status: 400 });
    const reference = `${kind === 'urgent' ? 'URG' : 'DEV'}-${Date.now().toString(36).toUpperCase()}`;
    const coordinates = kind === 'urgent' ? await geocode(data.location) : {};
    const payload = { ...data, ...coordinates, reference };
    let user = null;
    try { user = await base44.auth.me(); } catch { user = null; }
    const entities = user ? base44.entities : base44.asServiceRole.entities;
    const record = kind === 'urgent' ? await entities.UrgentRequest.create({ ...payload, status: 'to_verify', professionals_alerted: 0 }) : await entities.QuoteRequest.create({ ...payload, status: 'submitted' });
    return Response.json({ ok: true, reference, id: record.id });
  } catch (error) {
    console.error('createPublicRequest', error);
    return Response.json({ error: 'Impossible d’enregistrer la demande' }, { status: 500 });
  }
}