import { BriefcaseBusiness, Images, Inbox, MapPin, Radar, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const items = [
  ['demandes', 'Demandes reçues', Inbox],
  ['prestations', 'Prestations', BriefcaseBusiness],
  ['coordonnees', 'Coordonnées', MapPin],
  ['medias', 'Médias', Images],
  ['avis', 'Avis clients', Star]
];

export default function DashboardSidebar() {
  return <aside className="h-fit rounded-3xl border border-primary-foreground/20 bg-primary p-3 text-primary-foreground shadow-2xl lg:sticky lg:top-24"><p className="px-3 py-3 font-heading text-lg font-bold">Mon espace</p><Link to="/opportunites-pro" className="mb-2 flex items-center gap-3 rounded-2xl bg-destructive px-3 py-3 text-sm font-bold text-destructive-foreground"><Radar size={17}/>Carte des opportunités</Link><Link to="/extras-pro" className="mb-2 flex items-center gap-3 rounded-2xl bg-primary-foreground/15 px-3 py-3 text-sm font-bold"><Users size={17}/>Recruter des extras</Link><Link to="/suivi-extras" className="mb-2 flex items-center gap-3 rounded-2xl bg-primary-foreground/15 px-3 py-3 text-sm font-bold"><Users size={17}/>Suivi des Extras</Link><nav className="space-y-1">{items.map(([id, label, Icon], index) => <a key={id} href={`#${id}`} className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-colors ${index === 0 ? 'bg-primary-foreground text-primary' : 'hover:bg-primary-foreground/15'}`}><Icon size={17}/>{label}</a>)}</nav></aside>;
}