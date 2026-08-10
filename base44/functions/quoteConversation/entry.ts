import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    if (body.action === 'list_client') {
      const items = await base44.asServiceRole.entities.QuoteRequest.filter({ $or: [{ created_by_id: user.id }, { email: user.email }] }, '-last_activity_at', 200);
      const profileIds = [...new Set(items.map(item => item.caterer_id).filter(Boolean))];
      const profiles = profileIds.length ? await base44.asServiceRole.entities.CatererProfile.filter({ id: { $in: profileIds } }, '-created_date', 200) : [];
      const names = new Map(profiles.map(profile => [profile.id, profile.business_name]));
      return Response.json({ items: items.map(item => ({ ...item, caterer_business_name: names.get(item.caterer_id) || 'Traiteur en cours d’attribution' })) });
    }
    if (body.action === 'list_professional') {
      const profiles = await base44.asServiceRole.entities.CatererProfile.filter({ created_by_id: user.id }, '-created_date', 20);
      const profileIds = profiles.map(item => item.id);
      const profilePaths = profiles.filter(item => item.slug).map(item => `/traiteurs/${item.slug}`);
      const [items, bookings, assignments, visits] = await Promise.all([
        profileIds.length ? base44.asServiceRole.entities.QuoteRequest.filter({ caterer_id: { $in: profileIds } }, '-last_activity_at', 200) : [],
        base44.asServiceRole.entities.ExtraBooking.filter({ $or: [{ caterer_user_id: user.id }, { caterer_id: { $in: profileIds } }] }, 'booking_date', 300),
        base44.asServiceRole.entities.StaffAssignment.filter({ caterer_user_id: user.id }, 'event_date', 500),
        profilePaths.length ? base44.asServiceRole.entities.PageVisit.filter({ page_path: { $in: profilePaths } }, '-last_seen', 2000) : []
      ]);
      const quoteIds = items.map(item => item.id);
      const activities = quoteIds.length ? await base44.asServiceRole.entities.QuoteActivity.filter({ quote_id: { $in: quoteIds } }, '-created_date', 2000) : [];
      const now = new Date();
      const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
      const monthDay = monthStart.slice(0, 10);
      const today = now.toISOString().slice(0, 10);
      const respondedIds = new Set(activities.filter(item => item.actor === 'professional' && item.type === 'message' && item.created_date >= monthStart).map(item => item.quote_id));
      const workedExtraIds = new Set([
        ...bookings.filter(item => item.status === 'confirmed' && item.booking_date <= today).map(item => item.extra_profile_id),
        ...assignments.filter(item => item.assignee_type === 'extra' && item.status === 'accepted' && item.event_date <= today).map(item => item.extra_profile_id)
      ].filter(Boolean));
      const stats = {
        visits_total: visits.length,
        visits_month: visits.filter(item => item.visit_day >= monthDay).length,
        quotes_received: items.filter(item => item.created_date >= monthStart).length,
        quotes_responded: respondedIds.size,
        quotes_accepted: items.filter(item => item.status === 'closed' && item.updated_date >= monthStart).length,
        quotes_declined: items.filter(item => item.status === 'cancelled' && item.updated_date >= monthStart).length,
        extras_worked: workedExtraIds.size
      };
      return Response.json({ items, bookings, assignments, stats });
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
      if (['professional', 'client'].includes(actor)) {
        const sentByProfessional = actor === 'professional';
        try {
          await base44.functions.invoke('sendN8nWebhook', {
            entity_name: 'QuoteRequest',
            entity_id: quote.id,
            event_name: sentByProfessional ? 'quote_response_sent' : 'quote_client_response_sent',
            delivery_key: activity.id,
            context: {
              recipient_type: sentByProfessional ? 'client' : 'professional',
              recipient_email: sentByProfessional ? quote.email || '' : catererProfile?.email || quote.caterer_email || '',
              recipient_name: sentByProfessional ? [quote.first_name, quote.last_name].filter(Boolean).join(' ') : catererProfile?.business_name || 'Traiteur',
              sender_name: sentByProfessional ? catererProfile?.business_name || 'Votre traiteur' : [quote.first_name, quote.last_name].filter(Boolean).join(' ') || 'Votre client',
              notification_subject: sentByProfessional ? 'Vous avez reçu une réponse à votre demande' : `Vous avez reçu une réponse au devis ${quote.reference}`,
              caterer_name: catererProfile?.business_name || 'Traiteur',
              reference: quote.reference || '',
              message,
              conversation_url: sentByProfessional ? `https://bon-traiteur-go.base44.app/mes-devis?quote=${quote.id}` : 'https://bon-traiteur-go.base44.app/devis-traiteur',
              footer: 'Envoyé par unbontraiteur.com'
            }
          });
        } catch (notificationError) {
          console.error('Notification n8n non envoyée', notificationError);
        }
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
      const status = decision === 'accepted' ? 'closed' : 'cancelled';
      await base44.asServiceRole.entities.QuoteRequest.update(quote.id, { [`${actor}_decision`]: decision, status, last_activity_at: new Date().toISOString() });
      await base44.asServiceRole.entities.QuoteActivity.create({ quote_id: quote.id, type: `${actor}_decision`, label: `${actor === 'client' ? 'Client' : 'Traiteur'} : ${decision === 'accepted' ? 'devis accepté' : 'devis refusé'}`, actor });
    }
    if (body.action === 'delete' && actor === 'professional') {
      await base44.asServiceRole.entities.QuoteActivity.deleteMany({ quote_id: quote.id });
      await base44.asServiceRole.entities.QuoteRequest.delete(quote.id);
      return Response.json({ deleted: true, id: quote.id });
    }
    const allActivities = await base44.asServiceRole.entities.QuoteActivity.filter({ quote_id: quote.id }, '-created_date', 300);
    const activities = actor === 'client' ? allActivities.filter(item => item.type !== 'internal_note') : allActivities;
    const updated = await base44.asServiceRole.entities.QuoteRequest.get(quote.id);
    return Response.json({ item: { ...updated, caterer_business_name: catererProfile?.business_name || 'Traiteur en cours d’attribution' }, activities, actor });
  } catch (error) {
    console.error('quoteConversation', error);
    return Response.json({ error: error.message || 'Échange impossible' }, { status: 500 });
  }
}