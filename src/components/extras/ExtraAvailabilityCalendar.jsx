import {formatAvailabilityDate,getAvailabilityWindow} from '@/lib/extraAvailability';

export default function ExtraAvailabilityCalendar({value,onChange}) {
  const dates=getAvailabilityWindow(); const selected=new Set(value||[]);
  const toggle=date=>onChange(selected.has(date)?(value||[]).filter(item=>item!==date):[...(value||[]),date].sort());
  return <section className="rounded-2xl border p-4"><h2 className="text-lg font-bold">Mes disponibilités sur 30 jours</h2><p className="mt-1 font-normal text-muted-foreground">Facultatif — sélectionnez chaque jour où les traiteurs peuvent vous solliciter.</p><div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">{dates.map(date=><button type="button" key={date} aria-pressed={selected.has(date)} onClick={()=>toggle(date)} className={`rounded-xl border px-2 py-3 text-xs capitalize ${selected.has(date)?'border-primary bg-primary text-primary-foreground':'bg-card hover:bg-secondary'}`}>{formatAvailabilityDate(date)}</button>)}</div><p className="mt-3 text-xs font-normal text-muted-foreground">{selected.size} jour{selected.size!==1?'s':''} sélectionné{selected.size!==1?'s':''}</p></section>;
}