import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    if (body.website) return Response.json({ ok: true });
    const kind = body.kind === 'urgent' ? 'urgent' : 'quote';
    const data = body.data || {};
    const required = kind === 'urgent'
      ? ['event_date', 'location', 'event_type', 'guest_count', 'email', 'phone']
      : ['event_date', 'location', 'event_type', 'guest_count', 'first_name', 'email'];
    if (required.some((field) => !data[field])) {
      return Response.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }
    if (String(data.email).length > 160 || String(data.message || '').length > 3000) {
      return Response.json({ error: 'Données trop longues' }, { status: 400 });
    }
    const reference = `${kind === 'urgent' ? 'URG' : 'DEV'}-${Date.now().toString(36).toUpperCase()}`;
    const payload = { ...data, reference };
    const record = kind === 'urgent'
      ? await base44.asServiceRole.entities.UrgentRequest.create({ ...payload, status: 'to_verify', professionals_alerted: 0 })
      : await base44.asServiceRole.entities.QuoteRequest.create({ ...payload, status: 'submitted' });
    return Response.json({ ok: true, reference, id: record.id });
  } catch (error) {
    console.error('createPublicRequest', error);
    return Response.json({ error: 'Impossible d’enregistrer la demande' }, { status: 500 });
  }
});