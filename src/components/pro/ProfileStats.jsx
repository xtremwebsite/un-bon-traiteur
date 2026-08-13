import { BarChart3, CheckCircle2, Eye, Inbox, Send, XCircle } from 'lucide-react';

export default function ProfileStats({stats={},items=[]}) {
  const totalRequests=items.length;
  const decisions=(stats.quotes_accepted||0)+(stats.quotes_declined||0);
  const conversion=decisions?Math.round((stats.quotes_accepted||0)/decisions*100):0;
  const cards=[['Visites totales',stats.visits_total||0,Eye],['Visites ce mois',stats.visits_month||0,Eye],['Demandes totales',totalRequests,Inbox],['Demandes ce mois',stats.quotes_received||0,Inbox],['Réponses envoyées',stats.quotes_responded||0,Send],['Demandes acceptées',stats.quotes_accepted||0,CheckCircle2],['Demandes refusées',stats.quotes_declined||0,XCircle],['Conversion',`${conversion} %`,BarChart3]];
  return <section className="rounded-3xl border bg-card p-6 shadow-sm"><div><p className="text-xs font-bold uppercase tracking-widest text-destructive">Performance de la fiche</p><h2 className="mt-1 font-heading text-2xl font-bold">Statistiques détaillées</h2><p className="mt-1 text-sm text-muted-foreground">Les visites sont liées à votre fiche publique. Les demandes et décisions sont comptées sur le mois en cours, sauf le total.</p></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label,value,Icon])=><article key={label} className="rounded-2xl bg-secondary/60 p-4"><Icon size={20} className="text-primary"/><p className="mt-3 text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></article>)}</div></section>;
}