import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const sessionId = String(body.session_id || '').slice(0, 80);
    const pagePath = String(body.page_path || '').slice(0, 180);
    if (!/^[a-zA-Z0-9-]{16,80}$/.test(sessionId) || !pagePath.startsWith('/')) return Response.json({ error: 'Données invalides' }, { status: 400 });
    const now = new Date();
    const visitDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    const existing = await base44.asServiceRole.entities.PageVisit.filter({ session_id: sessionId, page_path: pagePath, visit_day: visitDay }, '-created_date', 1);
    const data = { session_id: sessionId, page_path: pagePath, visit_day: visitDay, last_seen: now.toISOString() };
    if (existing.length) await base44.asServiceRole.entities.PageVisit.update(existing[0].id, data);
    else await base44.asServiceRole.entities.PageVisit.create(data);
    return Response.json({ ok: true });
  } catch (error) {
    console.error('trackPageVisit', error);
    return Response.json({ error: 'Suivi indisponible' }, { status: 500 });
  }
}