import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Connexion requise' }, { status: 401 });
    const body = await req.json();
    const profileId = String(body.profile_id || '');
    if (!/^[a-f0-9]{24}$/i.test(profileId)) return Response.json({ error: 'Identifiant de fiche invalide' }, { status: 400 });
    if (body.action === 'approve_profile') {
      if (user.role !== 'admin') return Response.json({ error: 'Accès refusé' }, { status: 403 });
      const profiles = await base44.asServiceRole.entities.CatererProfile.filter({ id: profileId }, '-created_date', 1);
      const profile = profiles[0];
      if (!profile) return Response.json({ error: 'Fiche introuvable' }, { status: 404 });
      const item = await base44.asServiceRole.entities.CatererProfile.update(profile.id, { status: 'approved', published: true, verified: true });
      const operations = [];
      if (profile.claim_source_profile_id) operations.push(base44.asServiceRole.entities.CatererProfile.update(profile.claim_source_profile_id, { published: false, claim_status: 'claimed', claimed_profile_id: profile.id }));
      if (profile.created_by_id) operations.push(base44.asServiceRole.entities.User.update(profile.created_by_id, { account_type: 'caterer', account_status: 'verified' }));
      await Promise.all(operations);
      return Response.json({ item });
    }
    if (body.action !== 'claim') return Response.json({ error: 'Action inconnue' }, { status: 400 });
    const sources = await base44.asServiceRole.entities.CatererProfile.filter({ id: profileId }, '-created_date', 1);
    const source = sources[0];
    if (!source || source.profile_origin !== 'public_source' || !source.published) return Response.json({ error: 'Cette fiche ne peut pas être revendiquée' }, { status: 404 });
    if (source.claim_status === 'pending' || source.claim_status === 'claimed') return Response.json({ error: 'Une revendication est déjà en cours pour cette fiche' }, { status: 409 });
    const existing = await base44.asServiceRole.entities.CatererProfile.filter({ created_by_id: user.id }, '-created_date', 1);
    if (existing.length) return Response.json({ error: 'Votre compte possède déjà une fiche traiteur' }, { status: 409 });
    const { id, created_date, updated_date, created_by, created_by_id, claim_status, claimed_profile_id, claimed_by_user_id, ...details } = source;
    const item = await base44.entities.CatererProfile.create({ ...details, profile_origin: 'owner', claim_source_profile_id: source.id, status: 'pending', published: false, verified: false, demo: false });
    await Promise.all([
      base44.asServiceRole.entities.CatererProfile.update(source.id, { claim_status: 'pending', claimed_profile_id: item.id, claimed_by_user_id: user.id }),
      base44.asServiceRole.entities.User.update(user.id, { account_type: 'caterer', account_status: 'pending' })
    ]);
    return Response.json({ item });
  } catch (error) {
    console.error('claimCaterer', error);
    return Response.json({ error: error.message || 'Revendication impossible' }, { status: 500 });
  }
}