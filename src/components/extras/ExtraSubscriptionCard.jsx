import {useMemo,useState} from 'react';
import {Crown} from 'lucide-react';
import {base44} from '@/api/base44Client';

export default function ExtraSubscriptionCard({profile,bookings=[]}){
  const[busy,setBusy]=useState(false);const[error,setError]=useState('');
  const confirmed=useMemo(()=>{const month=new Date().toISOString().slice(0,7);return bookings.filter(item=>item.status==='confirmed'&&String(item.booking_date).startsWith(month)).length},[bookings]);
  const unlimited=profile?.subscription_plan==='unlimited'&&profile?.subscription_status==='active';
  const subscribe=async()=>{if(window.self!==window.top){window.alert('L’abonnement est disponible uniquement depuis l’application publiée.');return}setBusy(true);setError('');try{const response=await base44.functions.invoke('extraSubscription',{action:'checkout'});window.location.href=response.data.url}catch(err){setError(err.response?.data?.error||err.message);setBusy(false)}};
  return <section className="rounded-3xl border bg-card p-5 shadow-xl"><div className="flex items-start gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary text-primary"><Crown/></span><div><p className="text-xs font-bold uppercase tracking-widest text-destructive">Abonnement Extra</p><h2 className="text-xl font-bold">{unlimited?'Extra illimité':'Offre gratuite'}</h2></div></div><p className="mt-3 text-sm text-muted-foreground">{unlimited?'Vos missions confirmées sont illimitées.':`1 mission confirmée offerte par mois · ${confirmed}/1 utilisée ce mois-ci.`}</p>{!unlimited&&<button type="button" disabled={busy} onClick={subscribe} className="mt-4 w-full rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-50">{busy?'Ouverture…':'Passer en illimité · 10 €/mois'}</button>}{error&&<p className="mt-2 text-sm text-destructive">{error}</p>}</section>;
}