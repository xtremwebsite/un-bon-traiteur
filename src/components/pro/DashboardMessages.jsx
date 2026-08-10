import {Link} from 'react-router-dom';
import {MessageSquareText} from 'lucide-react';

const formatDate=value=>new Date(value).toLocaleString('fr-FR',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});

export default function DashboardMessages({items=[]}){
  return <section className="mt-6 rounded-3xl border bg-card p-6 shadow-sm">
    <div><p className="text-sm font-bold uppercase tracking-widest text-destructive">Messagerie</p><h2 className="mt-1 text-xl font-bold">Réponses reçues</h2></div>
    <div className="mt-4 grid gap-3 md:grid-cols-2">{items.map(item=><Link key={item.id} to={`/devis-traiteur?quote=${item.quote_id}`} className="rounded-2xl border bg-background p-4 transition-colors hover:border-primary">
      <div className="flex items-center gap-2 font-bold text-primary"><MessageSquareText size={18}/>{item.client_name}</div>
      <p className="mt-2 line-clamp-2 text-sm text-foreground">{item.details}</p>
      <p className="mt-2 text-xs text-muted-foreground">{item.reference} · {formatDate(item.created_date)}</p>
      <p className="mt-2 text-xs font-bold text-primary">Voir la fiche client et l’historique</p>
    </Link>)}{!items.length&&<p className="rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">Aucune réponse client reçue pour le moment.</p>}</div>
  </section>;
}