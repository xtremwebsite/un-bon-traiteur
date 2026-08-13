import { BarChart3, ClipboardList, MapPin } from 'lucide-react';

const tabs=[['services','Prestations',ClipboardList],['stats','Statistiques & SEO',BarChart3],['contact','Coordonnées',MapPin]];
export default function ProfileFormTabs({active,onChange}) {
  return <div className="grid gap-2 rounded-2xl bg-secondary/60 p-2 sm:grid-cols-3" role="tablist" aria-label="Rubriques de la fiche">{tabs.map(([id,label,Icon])=><button key={id} type="button" role="tab" aria-selected={active===id} onClick={()=>onChange(id)} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold ${active===id?'bg-primary text-primary-foreground shadow-md':'text-muted-foreground'}`}><Icon size={17}/>{label}</button>)}</div>;
}