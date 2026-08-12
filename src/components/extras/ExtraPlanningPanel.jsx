import {CalendarDays,MapPin} from 'lucide-react';
import {formatAvailabilityDate} from '@/lib/extraAvailability';

const statusLabel={pending:'En attente',confirmed:'Confirmée'};
export default function ExtraPlanningPanel({bookings=[]}){
  const today=new Date().toISOString().slice(0,10);
  const upcoming=bookings.filter(item=>['pending','confirmed'].includes(item.status)&&item.booking_date>=today).sort((a,b)=>a.booking_date.localeCompare(b.booking_date));
  return <section className="rounded-3xl border bg-card p-5 shadow-lg"><div className="flex items-center gap-2"><CalendarDays className="text-primary"/><h2 className="text-xl font-bold">Mon planning</h2></div><p className="mt-1 text-sm text-muted-foreground">Vos prochaines prestations et demandes en attente.</p>{upcoming.length?<div className="mt-4 grid gap-3">{upcoming.map(item=><article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-secondary/20 p-4"><div><p className="font-bold capitalize">{formatAvailabilityDate(item.booking_date)} · {item.caterer_name||'Traiteur'}</p><p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin size={14}/>{item.location||item.caterer_city||'Lieu à confirmer'}</p></div><span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold">{statusLabel[item.status]}</span></article>)}</div>:<p className="mt-4 rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">Aucune prestation à venir.</p>}</section>;
}