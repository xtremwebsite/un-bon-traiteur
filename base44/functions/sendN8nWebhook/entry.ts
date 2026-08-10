import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

const targets = {
  production: 'https://n8n.xtremwebsite.com/webhook/unbontraiteur',
  test: 'https://n8n.xtremwebsite.com/webhook-test/unbontraiteur'
};
const allowedEntities = ['QuoteRequest', 'UrgentRequest', 'CatererProfile'];

async function sign(body, secret) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(signature)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export default async function(req: Request): Promise<Response> {
  const base44 = createClientFromRequest(req);
  let logId = '';
  try {
    const { entity_name, entity_id, event_name, mode: requestedMode } = await req.json();
    const configs = requestedMode ? [] : await base44.asServiceRole.entities.WebhookConfig.list('-updated_date', 1);
    const mode = requestedMode || configs[0]?.mode || 'production';
    if (!allowedEntities.includes(entity_name) || !entity_id || !event_name || !targets[mode]) return Response.json({ error: 'Invalid webhook payload' }, { status: 400 });
    const idempotencyKey = `${event_name}:${entity_id}:${mode}`;
    const existing = await base44.asServiceRole.entities.WebhookDelivery.filter({ idempotency_key: idempotencyKey }, '-created_date', 1);
    if (existing[0]?.status === 'delivered' || existing[0]?.status === 'pending') return Response.json({ ok: true, duplicate: true, status: existing[0].status });
    const attempt = (existing[0]?.attempts || 0) + 1;
    if (existing[0]) {
      logId = existing[0].id;
      await base44.asServiceRole.entities.WebhookDelivery.update(logId, { status: 'pending', attempts: attempt, error_message: '' });
    } else {
      const created = await base44.asServiceRole.entities.WebhookDelivery.create({ idempotency_key: idempotencyKey, event_name, entity_name, entity_id, target: mode, status: 'pending', attempts: 1 });
      logId = created.id;
    }
    const record = await base44.asServiceRole.entities[entity_name].get(entity_id);
    if (!record) throw new Error('Source record not found');
    const payload = { event: event_name, idempotency_key: idempotencyKey, occurred_at: new Date().toISOString(), entity: entity_name, data: record };
    const body = JSON.stringify(payload);
    const signature = await sign(body, secrets.get('N8N_WEBHOOK_SECRET'));
    const response = await fetch(targets[mode], { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Webhook-Signature': `sha256=${signature}`, 'X-Idempotency-Key': idempotencyKey, 'X-Webhook-Event': event_name }, body });
    const responseText = (await response.text()).slice(0, 500);
    if (!response.ok) throw new Error(`n8n HTTP ${response.status}: ${responseText}`);
    await base44.asServiceRole.entities.WebhookDelivery.update(logId, { status: 'delivered', http_status: response.status, response_excerpt: responseText, sent_at: new Date().toISOString(), error_message: '' });
    return Response.json({ ok: true, event: event_name, status: response.status });
  } catch (error) {
    console.error('n8n webhook delivery failed', error);
    if (logId) await base44.asServiceRole.entities.WebhookDelivery.update(logId, { status: 'failed', error_message: error.message, sent_at: new Date().toISOString() });
    return Response.json({ ok: false, error: error.message }, { status: 502 });
  }
}