import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
    const result = await base44.asServiceRole.entities.QuoteRequest.deleteMany({ event_date: { $lt: today } });
    return Response.json({ ok: true, cutoff_date: today, deleted: result.deletedCount || 0 });
  } catch (error) {
    console.error('cleanupExpiredQuotes', error);
    return Response.json({ error: 'Impossible de supprimer les demandes expirées' }, { status: 500 });
  }
}