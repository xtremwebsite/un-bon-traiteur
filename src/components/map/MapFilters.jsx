import { ChefHat, Siren } from 'lucide-react';

export default function MapFilters({ mode, onChange, urgentCount }) {
  return <div className="mb-5 inline-flex rounded-2xl border bg-card p-1.5 shadow-sm" aria-label="Contenu de la carte">
    <button type="button" onClick={() => onChange('caterers')} aria-pressed={mode === 'caterers'} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${mode === 'caterers' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><ChefHat className="h-4 w-4"/>Traiteurs</button>
    <button type="button" onClick={() => onChange('urgent')} aria-pressed={mode === 'urgent'} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${mode === 'urgent' ? 'bg-destructive text-destructive-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><Siren className="h-4 w-4"/>Urgences {urgentCount > 0 && <span className="rounded-full bg-background/20 px-2 py-0.5 text-xs">{urgentCount}</span>}</button>
  </div>;
}