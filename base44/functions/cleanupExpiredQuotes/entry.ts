import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const cutoff = new Date(Date.now() - 15 * 86400000).toISOString();
    const expired = await base44.asServiceRole.entities.QuoteRequest.filter({ created_date: { $lt: cutoff } }, '-created_date', 500);
    if (expired.length) {
      await base44.asServiceRole.entities.QuoteActivity.deleteMany({ quote_id: { $in: expired.map(item => item.id) } });
      await base44.asServiceRole.entities.QuoteRequest.deleteMany({ id: { $in: expired.map(item => item.id) } });
    }
    return Response.json({ ok: true, cutoff_date: cutoff, deleted: expired.length });
  } catch (error) {
    console.error('cleanupExpiredQuotes', error);
    return Response.json({ error: 'Impossible de supprimer les demandes expirées' }, { status: 500 });
  }
}