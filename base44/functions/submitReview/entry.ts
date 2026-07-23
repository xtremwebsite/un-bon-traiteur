import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    if (body.website) return Response.json({ ok: true });
    const catererId = String(body.caterer_id || '').trim();
    const reviewerName = String(body.reviewer_name || '').trim();
    const comment = String(body.comment || '').trim();
    const rating = Number(body.rating);
    if (!catererId || !reviewerName || comment.length < 10 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return Response.json({ error: 'Avis incomplet ou invalide' }, { status: 400 });
    }
    if (reviewerName.length > 80 || comment.length > 1500) {
      return Response.json({ error: 'Avis trop long' }, { status: 400 });
    }
    await base44.asServiceRole.entities.Review.create({
      caterer_id: catererId,
      source: 'internal',
      reviewer_name: reviewerName,
      rating,
      comment,
      review_date: new Date().toISOString().slice(0, 10),
      status: 'pending',
      verified_booking: false
    });
    return Response.json({ ok: true });
  } catch (error) {
    console.error('submitReview', error);
    return Response.json({ error: 'Impossible d’enregistrer l’avis' }, { status: 500 });
  }
});