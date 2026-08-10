import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    if (body.action === 'list_professional') {
      const profiles = await base44.asServiceRole.entities.CatererProfile.filter({ created_by_id: user.id }, '-created_date', 20);
      const profileIds = profiles.map(item => item.id);
      const [items, bookings, assignments] = await Promise.all([
        profileIds.length ? base44.asServiceRole.entities.QuoteRequest.filter({ caterer_id: { $in: profileIds } }, '-last_activity_at', 200) : [],
        base44.asServiceRole.entities.ExtraBooking.filter({ $or: [{ caterer_user_id: user.id }, { caterer_id: { $in: profileIds } }] }, 'booking_date', 300),
        base44.asServiceRole.entities.StaffAssignment.filter({ caterer_user_id: user.id }, 'event_date', 500)
      ]);
      return Response.json({ items, bookings, assignments });
    }
    const quote = await base44.asServiceRole.entities.QuoteRequest.get(String(body.quote_id || ''));
    if (!quote) return Response.json({ error: 'Devis introuvable' }, { status: 404 });
    let actor = '';
    let catererProfile = null;
    if (quote.caterer_id) {
      catererProfile = await base44.asServiceRole.entities.CatererProfile.get(quote.caterer_id);
      if (catererProfile?.created_by_id === user.id) actor = 'professional';
    }
    if (!actor && user.role === 'admin') actor = 'admin';
    if (!actor && (quote.created_by_id === user.id || quote.email === user.email)) actor = 'client';
    if (!actor) return Response.json({ error: 'Forbidden' }, { status: 403 });
    if (body.action === 'history' && actor === 'professional') {
      await base44.asServiceRole.entities.QuoteActivity.create({ quote_id: quote.id, type: 'view', label: 'Dossier ouvert par le traiteur', actor });
    }
    if (body.action === 'message') {
      const message = String(body.message || '').trim().slice(0, 2000);
      if (!message) return Response.json({ error: 'Message vide' }, { status: 400 });
      const activity = await base44.asServiceRole.entities.QuoteActivity.create({ quote_id: quote.id, type: 'message', label: actor === 'professional' ? 'Réponse du traiteur' : actor === 'client' ? 'Message du client' : 'Message administrateur', details: message, actor });
      await base44.asServiceRole.entities.QuoteRequest.update(quote.id, { status: actor === 'professional' ? 'responses_received' : quote.status, last_activity_at: new Date().toISOString() });
      if (actor === 'professional') {
        await base44.functions.invoke('sendN8nWebhook', {
          entity_name: 'QuoteRequest',
          entity_id: quote.id,
          event_name: 'quote_response_sent',
          delivery_key: activity.id,
          context: {
            recipient_email: quote.email || '',
            recipient_name: [quote.first_name, quote.last_name].filter(Boolean).join(' '),
            caterer_name: catererProfile?.business_name || 'Votre traiteur',
            caterer_email: catererProfile?.email || catererProfile?.created_by || '',
            message,
            footer: 'Envoyé par unbontraiteur.com'
          }
        });
      }
    }
    if (body.action === 'note' && actor === 'professional') {
      const note = String(body.message || '').trim().slice(0, 2000);
      if (!note) return Response.json({ error: 'Note vide' }, { status: 400 });
      await base44.asServiceRole.entities.QuoteActivity.create({ quote_id: quote.id, type: 'internal_note', label: 'Note interne', details: note, actor });
      await base44.asServiceRole.entities.QuoteRequest.update(quote.id, { last_activity_at: new Date().toISOString() });
    }
    if (body.action === 'status' && actor === 'professional') {
      const allowed = ['submitted', 'matched', 'responses_received', 'closed', 'cancelled'];
      const status = String(body.status || '');
      if (!allowed.includes(status)) return Response.json({ error: 'Statut invalide' }, { status: 400 });
      await base44.asServiceRole.entities.QuoteRequest.update(quote.id, { status, last_activity_at: new Date().toISOString() });
      await base44.asServiceRole.entities.QuoteActivity.create({ quote_id: quote.id, type: 'status', label: `Statut modifié : ${status}`, actor });
    }
    if (body.action === 'decision' && ['client', 'professional'].includes(actor)) {
      const decision = body.decision === 'accepted' ? 'accepted' : body.decision === 'declined' ? 'declined' : '';
      if (!decision) return Response.json({ error: 'Décision invalide' }, { status: 400 });
      const decisions = { client: quote.client_decision || 'pending', professional: quote.professional_decision || 'pending', [actor]: decision };
      const status = decisions.client === 'declined' || decisions.professional === 'declined' ? 'cancelled' : decisions.client === 'accepted' && decisions.professional === 'accepted' ? 'closed' : decisions.professional === 'accepted' ? 'responses_received' : 'matched';
      await base44.asServiceRole.entities.QuoteRequest.update(quote.id, { [`${actor}_decision`]: decision, status, last_activity_at: new Date().toISOString() });
      await base44.asServiceRole.entities.QuoteActivity.create({ quote_id: quote.id, type: `${actor}_decision`, label: `${actor === 'client' ? 'Client' : 'Traiteur'} : ${decision === 'accepted' ? 'devis accepté' : 'devis refusé'}`, actor });
    }
    const allActivities = await base44.asServiceRole.entities.QuoteActivity.filter({ quote_id: quote.id }, '-created_date', 300);
    const activities = actor === 'client' ? allActivities.filter(item => item.type !== 'internal_note') : allActivities;
    const updated = await base44.asServiceRole.entities.QuoteRequest.get(quote.id);
    return Response.json({ item: updated, activities, actor });
  } catch (error) {
    console.error('quoteConversation', error);
    return Response.json({ error: error.message || 'Échange impossible' }, { status: 500 });
  }
}