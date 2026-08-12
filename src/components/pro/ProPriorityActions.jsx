import {AlertTriangle,MessageSquare,UserCheck} from 'lucide-react';
import {Link} from 'react-router-dom';

export default function ProPriorityActions({messages=0,cancellations=0,pendingExtras=0,shortages=[],hasTeam=false}){
  const hasPriority=messages>0||cancellations>0||pendingExtras>0||shortages.length>0||!hasTeam;
  return <section className="rounded-3xl border bg-card p-6 shadow-sm">
    <h2 className="text-xl font-bold">Actions prioritaires</h2>
    {messages>0&&<a href="#messagerie" className="mt-4 flex gap-3 rounded-2xl bg-primary/10 p-4"><MessageSquare className="shrink-0 text-primary"/><span><b>{messages} message{messages>1?'s':''} à traiter</b><small className="mt-1 block text-muted-foreground">Répondez aux demandes en attente.</small></span></a>}
    {cancellations>0&&<Link to="/suivi-extras?tab=tracking" className="mt-3 flex gap-3 rounded-2xl bg-destructive/10 p-4"><AlertTriangle className="shrink-0 text-destructive"/><span><b>{cancellations} annulation{cancellations>1?'s':''} à vérifier</b><small className="mt-1 block text-muted-foreground">Consultez les missions concernées.</small></span></Link>}
    {pendingExtras>0&&<Link to="/suivi-extras?tab=tracking" className="mt-3 flex gap-3 rounded-2xl bg-chart-4/20 p-4"><UserCheck className="shrink-0 text-primary"/><span><b>{pendingExtras} Extra{pendingExtras>1?'s':''} en attente de validation</b><small className="mt-1 block text-muted-foreground">Acceptez ou refusez les candidatures.</small></span></Link>}
    {!hasTeam&&<Link to="/profil-traiteur" className="mt-3 flex gap-3 rounded-2xl bg-chart-4/20 p-4"><AlertTriangle className="shrink-0 text-destructive"/><span><b>Renseignez votre équipe interne</b><small className="mt-1 block text-muted-foreground">Le CRM pourra calculer précisément vos besoins en Extras.</small></span></Link>}
    {shortages.slice(0,3).map(day=><Link key={day.date} to="/planning-traiteur" className="mt-3 flex gap-3 rounded-2xl bg-destructive/10 p-4"><AlertTriangle className="shrink-0 text-destructive"/><span><b>{day.shortage} renfort(s) à prévoir le {new Date(`${day.date}T12:00:00`).toLocaleDateString('fr-FR')}</b><small className="mt-1 block text-muted-foreground">{day.required} personnes estimées, {day.internal} internes et {day.extras} Extras déjà affectés.</small></span></Link>)}
    {!hasPriority&&<p className="mt-4 rounded-2xl bg-secondary p-4 text-sm">Aucune action prioritaire pour le moment.</p>}
  </section>;
}