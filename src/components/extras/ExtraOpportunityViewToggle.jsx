import { LayoutGrid, Map } from 'lucide-react';

export default function ExtraOpportunityViewToggle({ value, onChange }) {
  return <div className="grid grid-cols-2 rounded-2xl border bg-card p-1 shadow-sm lg:hidden" aria-label="Mode d’affichage">
    <button type="button" onClick={() => onChange('map')} aria-pressed={value === 'map'} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold ${value === 'map' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}><Map size={17}/>Carte</button>
    <button type="button" onClick={() => onChange('grid')} aria-pressed={value === 'grid'} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold ${value === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}><LayoutGrid size={17}/>Grille</button>
  </div>;
}