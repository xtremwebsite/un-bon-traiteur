import {useMemo,useState} from 'react';
import {Crown} from 'lucide-react';
import {base44} from '@/api/base44Client';

export default function ExtraSubscriptionCard({profile,bookings=[],compact=false}){
  const[busy,setBusy]=useState(false);const[error,setError]=useState('');
  const confirmed=useMemo(()=>{const month=new Date().toISOString().slice(0,7);return bookings.filter(item=>item.status==='confirmed'&&String(item.booking_date).startsWith(month)).length},[bookings]);
  const unlimited=profile?.subscription_plan==='unlimited'&&profile?.subscription_status==='active';
  const subscribe=async()=>{if(window.self!==window.top){window.alert('L’abonnement est disponible uniquement depuis l’application publiée.');return}setBusy(true);setError('');try{const response=await base44.functions.invoke('extraSubscription',{action:'checkout'});window.location.href=response.data.url}catch(err){setError(err.response?.data?.error||err.message);setBusy(false)}};
  return <section className={`rounded-3xl border bg-card shadow-xl ${compact?'p-4':'p-5'}`}><div className="flex items-start gap-3"><span className={`grid place-items-center rounded-2xl bg-secondary text-primary ${compact?'h-9 w-9':'h-11 w-11'}`}><Crown size={compact?18:24}/></span><div><p className="text-xs font-bold uppercase tracking-widest text-destructive">Abonnement</p><h2 className={compact?'text-base font-bold':'text-xl font-bold'}>{unlimited?'Extra illimité':'Offre gratuite'}</h2></div></div><p className="mt-3 text-xs text-muted-foreground">{unlimited?'Missions confirmées illimitées.':`1 mission offerte par mois · ${confirmed}/1 utilisée.`}</p>{!unlimited&&<button type="button" disabled={busy} onClick={subscribe} className="mt-3 w-full rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">{busy?'Ouverture…':'Illimité · 10 €/mois'}</button>}{error&&<p className="mt-2 text-xs text-destructive">{error}</p>}</section>;
}