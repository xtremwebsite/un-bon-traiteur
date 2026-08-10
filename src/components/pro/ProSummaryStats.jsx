import {CheckCircle2,Eye,Inbox,Send,UserRoundCheck,XCircle} from 'lucide-react';

export default function ProSummaryStats({stats={}}){
  const cards=[
    ['Visites totales',stats.visits_total||0,Eye],
    ['Visites ce mois',stats.visits_month||0,Eye],
    ['Devis reçus',stats.quotes_received||0,Inbox],
    ['Devis répondus',stats.quotes_responded||0,Send],
    ['Devis acceptés',stats.quotes_accepted||0,CheckCircle2],
    ['Devis refusés',stats.quotes_declined||0,XCircle],
    ['Extras mobilisés',stats.extras_worked||0,UserRoundCheck]
  ];
  return <section className="mb-6 rounded-3xl border bg-card p-6 shadow-sm"><div className="flex flex-wrap items-end justify-between gap-2"><div><h2 className="text-xl font-bold">Statistiques</h2><p className="mt-1 text-sm text-muted-foreground">Activité depuis le début du mois, sauf le total des visites et des Extras.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label,value,Icon])=><article key={label} className="rounded-2xl bg-secondary/60 p-4"><Icon size={20} className="text-primary"/><p className="mt-3 text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></article>)}</div></section>;
}