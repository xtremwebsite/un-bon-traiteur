import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const plans = ['none', 'bronze', 'argent', 'or'];
const statuses = ['inactive', 'trialing', 'active', 'past_due', 'cancelled'];

export default function ProAccountActions({ user, onUpdate }) {
  const [sent, setSent] = useState(false); const [error, setError] = useState('');
  if (!user) return <span className="text-xs text-muted-foreground">Compte non associé</span>;
  const reset = async () => { setError(''); try { await base44.auth.resetPasswordRequest(user.email); setSent(true); } catch { setError('Envoi impossible'); } };
  return <div className="grid min-w-44 gap-2"><select value={user.subscription_plan || 'none'} onChange={e => onUpdate(user.id, { subscription_plan: e.target.value })} className="h-9 rounded-lg border bg-background px-2 text-xs">{plans.map(plan => <option key={plan} value={plan}>{plan === 'none' ? 'Sans abonnement' : plan[0].toUpperCase() + plan.slice(1)}</option>)}</select><select value={user.subscription_status || 'inactive'} onChange={e => onUpdate(user.id, { subscription_status: e.target.value })} className="h-9 rounded-lg border bg-background px-2 text-xs">{statuses.map(status => <option key={status} value={status}>{status}</option>)}</select><button type="button" onClick={reset} disabled={sent} className="flex items-center justify-center gap-2 rounded-lg border px-2 py-2 text-xs font-semibold disabled:opacity-60"><KeyRound size={14}/>{sent ? 'Lien envoyé' : 'Réinitialiser le mot de passe'}</button>{error&&<span className="text-xs text-destructive">{error}</span>}</div>;
}