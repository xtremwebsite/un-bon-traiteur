import {useState} from 'react';
import {ChevronDown,ChevronUp,History,MapPin,XCircle} from 'lucide-react';
import {formatAvailabilityDate} from '@/lib/extraAvailability';

const periodLabel=value=>value==='evening'?'Soirée':value==='both'?'Journée et soirée':'Journée';

export default function ExtraMissionHistory({bookings=[],onCancel}){
  const[expanded,setExpanded]=useState('');
  const today=new Date().toISOString().slice(0,10);
  const pending=bookings.filter(item=>item.initiated_by==='extra'&&item.status==='pending').sort((a,b)=>a.booking_date.localeCompare(b.booking_date));
  const completed=bookings.filter(item=>item.status==='confirmed'&&item.booking_date<today).sort((a,b)=>b.booking_date.localeCompare(a.booking_date));

  const card=(item,label,badgeClass,actions=false)=>{
    const open=expanded===item.id;
    return (
      <article key={item.id} className="rounded-2xl border p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div><h3 className="font-bold">{item.caterer_name||'Traiteur'}</h3><p className="mt-1 text-sm capitalize text-muted-foreground">{formatAvailabilityDate(item.booking_date)} · {periodLabel(item.period)}</p></div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClass}`}>{label}</span>
        </div>
        <p className="mt-3 flex items-center gap-1 text-sm"><MapPin size={14}/>{item.location||item.caterer_city||'Lieu non renseigné'}</p>
        {actions&&<div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={()=>setExpanded(open?'':item.id)} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold text-primary">{open?<ChevronUp size={16}/>:<ChevronDown size={16}/>}Voir les informations</button>
          <button type="button" onClick={()=>onCancel?.(item)} className="inline-flex items-center gap-2 rounded-full border border-destructive px-4 py-2 text-sm font-bold text-destructive"><XCircle size={16}/>Me désister</button>
        </div>}
        {open&&<div className="mt-4 rounded-2xl bg-secondary/60 p-4 text-sm">
          <p><b>Traiteur :</b> {item.caterer_name||'Non renseigné'}</p>
          <p className="mt-2"><b>Date et période :</b> {formatAvailabilityDate(item.booking_date)} · {periodLabel(item.period)}</p>
          <p className="mt-2"><b>Lieu :</b> {item.location||item.caterer_city||'Non renseigné'}</p>
          <p className="mt-2"><b>Mission :</b> {item.service_details||'Aucun détail complémentaire.'}</p>
        </div>}
        {!actions&&item.service_details&&<p className="mt-2 text-sm"><b>Prestation :</b> {item.service_details}</p>}
      </article>
    );
  };

  return <div className="space-y-6"><section className="rounded-3xl border bg-card p-5 shadow-lg"><div className="flex items-center gap-2"><History className="text-primary"/><h2 className="text-xl font-bold">Mes candidatures</h2></div><p className="mt-1 text-sm text-muted-foreground">Les missions auxquelles vous avez postulé et qui attendent une réponse du traiteur.</p>{pending.length?<div className="mt-5 grid gap-3">{pending.map(item=>card(item,'En attente','bg-secondary text-primary',true))}</div>:<p className="mt-5 rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">Aucune candidature en attente.</p>}</section><section className="rounded-3xl border bg-card p-5 shadow-lg"><h2 className="text-xl font-bold">Historique des prestations</h2><p className="mt-1 text-sm text-muted-foreground">Toutes vos missions réalisées, de la plus récente à la plus ancienne.</p>{completed.length?<div className="mt-5 grid gap-3">{completed.map(item=>card(item,'Réalisée','bg-secondary'))}</div>:<p className="mt-5 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Aucune prestation passée pour le moment.</p>}</section></div>;
}