import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import { CalendarDays, FileText, MapPin } from 'lucide-react';

const labels = { submitted:'Demande envoyée', matched:'Traiteurs sélectionnés', responses_received:'Réponses reçues', closed:'Terminée', cancelled:'Annulée', to_verify:'En vérification', validated:'Validée', broadcast:'Diffusée', fulfilled:'Pourvue', expired:'Expirée' };

export default function AccountPortal() {
  const [state,setState]=useState({loading:true,user:null,professional:false,quotes:[],urgent:[]});
  useEffect(()=>{Promise.all([base44.auth.me(),base44.entities.CatererProfile.filter({},'-created_date',1),base44.entities.QuoteRequest.list('-created_date',100),base44.entities.UrgentRequest.list('-created_date',100)]).then(([user,profiles,quotes,urgent])=>setState({loading:false,user,professional:profiles.some(profile=>profile.created_by_id===user.id),quotes,urgent}))},[]);
  if(state.loading)return <div className="min-h-screen animate-pulse bg-muted"/>;
  if(state.user?.role==='admin')return <Navigate to="/admin" replace/>;
  if(state.professional)return <Navigate to="/tableau-de-bord-traiteur" replace/>;
  const requests=[...state.quotes.map(item=>({...item,kind:'Devis'})),...state.urgent.map(item=>({...item,kind:'Urgence'}))].sort((a,b)=>new Date(b.created_date)-new Date(a.created_date));
  return <><Header/><main className="min-h-screen bg-primary/5 px-4 py-10"><div className="mx-auto max-w-5xl"><p className="font-bold text-destructive">Espace particulier</p><h1 className="mt-2 font-heading text-4xl font-bold">Mes demandes et réponses</h1><p className="mt-2 text-muted-foreground">Suivez ici l’avancement de vos demandes de devis et demandes urgentes.</p>{requests.length?<div className="mt-8 grid gap-4">{requests.map(item=><article key={`${item.kind}-${item.id}`} className="rounded-3xl border bg-card p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-destructive">{item.kind} · {item.reference}</p><h2 className="mt-2 text-xl font-bold">{item.event_type}</h2></div><span className="rounded-full bg-secondary px-4 py-2 text-sm font-bold text-primary">{labels[item.status]||item.status}</span></div><div className="mt-5 flex flex-wrap gap-5 text-sm text-muted-foreground"><span className="flex items-center gap-2"><CalendarDays size={16}/>{item.event_date}</span><span className="flex items-center gap-2"><MapPin size={16}/>{item.location}</span><span className="flex items-center gap-2"><FileText size={16}/>{item.guest_count} invités</span></div>{item.status==='responses_received'&&<p className="mt-5 rounded-2xl bg-primary/5 p-4 font-semibold text-primary">Des réponses de traiteurs sont disponibles pour cette demande.</p>}</article>)}</div>:<div className="mt-8 rounded-3xl border bg-card p-10 text-center"><FileText className="mx-auto text-primary"/><h2 className="mt-4 text-xl font-bold">Aucune demande</h2><p className="mt-2 text-muted-foreground">Vos prochaines demandes apparaîtront ici.</p></div>}</div></main><Footer/></>;
}