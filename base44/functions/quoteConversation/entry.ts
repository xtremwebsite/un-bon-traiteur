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
      const items = profileIds.length ? await base44.asServiceRole.entities.QuoteRequest.filter({ caterer_id: { $in: profileIds } }, '-created_date', 100) : [];
      return Response.json({ items });
    }
    const quote = await base44.asServiceRole.entities.QuoteRequest.get(String(body.quote_id || ''));
    if (!quote) return Response.json({ error: 'Devis introuvable' }, { status: 404 });
    let actor = user.role === 'admin' ? 'admin' : quote.created_by_id === user.id || quote.email === user.email ? 'client' : '';
    if (!actor && quote.caterer_id) {
      const profile = await base44.asServiceRole.entities.CatererProfile.get(quote.caterer_id);
      if (profile?.created_by_id === user.id) actor = 'professional';
    }
    if (!actor) return Response.json({ error: 'Forbidden' }, { status: 403 });
    if (body.action === 'message') {
      const message = String(body.message || '').trim().slice(0, 2000);
      if (!message) return Response.json({ error: 'Message vide' }, { status: 400 });
      await base44.asServiceRole.entities.QuoteActivity.create({ quote_id: quote.id, type: 'message', label: actor === 'professional' ? 'Réponse du traiteur' : actor === 'client' ? 'Message du client' : 'Message administrateur', details: message, actor });
      await base44.asServiceRole.entities.QuoteRequest.update(quote.id, { status: actor === 'professional' ? 'responses_received' : quote.status, last_activity_at: new Date().toISOString() });
    }
    if (body.action === 'decision' && ['client', 'professional'].includes(actor)) {
      const decision = body.decision === 'accepted' ? 'accepted' : body.decision === 'declined' ? 'declined' : '';
      if (!decision) return Response.json({ error: 'Décision invalide' }, { status: 400 });
      const decisions = { client: quote.client_decision || 'pending', professional: quote.professional_decision || 'pending', [actor]: decision };
      const status = decisions.client === 'declined' || decisions.professional === 'declined' ? 'cancelled' : decisions.client === 'accepted' && decisions.professional === 'accepted' ? 'closed' : decisions.professional === 'accepted' ? 'responses_received' : 'matched';
      await base44.asServiceRole.entities.QuoteRequest.update(quote.id, { [`${actor}_decision`]: decision, status, last_activity_at: new Date().toISOString() });
      await base44.asServiceRole.entities.QuoteActivity.create({ quote_id: quote.id, type: `${actor}_decision`, label: `${actor === 'client' ? 'Client' : 'Traiteur'} : ${decision === 'accepted' ? 'devis accepté' : 'devis refusé'}`, actor });
    }
    const activities = await base44.asServiceRole.entities.QuoteActivity.filter({ quote_id: quote.id }, 'created_date', 200);
    const updated = await base44.asServiceRole.entities.QuoteRequest.get(quote.id);
    return Response.json({ item: updated, activities, actor });
  } catch (error) {
    console.error('quoteConversation', error);
    return Response.json({ error: error.message || 'Échange impossible' }, { status: 500 });
  }
}