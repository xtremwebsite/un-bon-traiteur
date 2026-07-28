import { ChefHat, Layers3, Siren } from 'lucide-react';

export default function MapFilters({ mode, onChange, urgentCount }) {
  const style = active => `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`;
  return <div className="mb-5 inline-flex max-w-full overflow-x-auto rounded-2xl border bg-card p-1.5 shadow-sm" aria-label="Contenu de la carte">
    <button type="button" onClick={() => onChange('all')} aria-pressed={mode === 'all'} className={style(mode === 'all')}><Layers3 className="h-4 w-4"/>Tous</button>
    <button type="button" onClick={() => onChange('caterers')} aria-pressed={mode === 'caterers'} className={style(mode === 'caterers')}><ChefHat className="h-4 w-4"/>Traiteurs</button>
    <button type="button" onClick={() => onChange('urgent')} aria-pressed={mode === 'urgent'} className={style(mode === 'urgent')}><Siren className="h-4 w-4"/>Urgences {urgentCount > 0 && <span className="rounded-full bg-background/20 px-2 py-0.5 text-xs">{urgentCount}</span>}</button>
  </div>;
}