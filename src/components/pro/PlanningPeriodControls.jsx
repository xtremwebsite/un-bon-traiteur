import {ChevronLeft,ChevronRight} from 'lucide-react';

export default function PlanningPeriodControls({view,label,onView,onPrevious,onNext,onToday}){
  return <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-3">
    <div className="flex rounded-xl bg-secondary p-1">
      <button onClick={()=>onView('week')} className={`rounded-lg px-3 py-2 text-sm font-bold ${view==='week'?'bg-primary text-primary-foreground':''}`}>Semaine</button>
      <button onClick={()=>onView('month')} className={`rounded-lg px-3 py-2 text-sm font-bold ${view==='month'?'bg-primary text-primary-foreground':''}`}>Mois</button>
    </div>
    <p className="min-w-48 text-center font-bold capitalize">{label}</p>
    <div className="flex items-center gap-1">
      <button onClick={onPrevious} aria-label="Période précédente" className="rounded-lg border p-2"><ChevronLeft size={18}/></button>
      <button onClick={onToday} className="rounded-lg border px-3 py-2 text-sm font-bold">Aujourd’hui</button>
      <button onClick={onNext} aria-label="Période suivante" className="rounded-lg border p-2"><ChevronRight size={18}/></button>
    </div>
  </div>;
}