import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 });
    const { action, reviewId, reply } = await req.json();
    const profiles = await base44.asServiceRole.entities.CatererProfile.filter({ created_by_id: user.id }, '-created_date', 1);
    const profile = profiles[0];
    if (!profile) return Response.json({ error: 'Fiche traiteur introuvable' }, { status: 404 });
    if (action === 'list') {
      const reviews = await base44.asServiceRole.entities.Review.filter({ caterer_id: profile.id }, '-review_date', 100);
      return Response.json({ reviews });
    }
    if (action === 'reply') {
      if (!reviewId || !reply?.trim()) return Response.json({ error: 'Réponse requise' }, { status: 400 });
      const review = await base44.asServiceRole.entities.Review.get(reviewId);
      if (!review || review.caterer_id !== profile.id) return Response.json({ error: 'Avis introuvable' }, { status: 404 });
      const updated = await base44.asServiceRole.entities.Review.update(reviewId, { professional_reply: reply.trim(), reply_date: new Date().toISOString().slice(0, 10) });
      return Response.json({ review: updated });
    }
    return Response.json({ error: 'Action invalide' }, { status: 400 });
  } catch (error) {
    console.error('manageProReviews', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});