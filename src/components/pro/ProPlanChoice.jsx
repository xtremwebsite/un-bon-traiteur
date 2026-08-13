import {useState} from 'react';
import {Check} from 'lucide-react';
import {base44} from '@/api/base44Client';

const plans=[
  {id:'bronze',name:'Bronze',price:29,description:'Pour démarrer et présenter votre activité.'},
  {id:'argent',name:'Argent',price:59,description:'Pour développer votre visibilité et vos demandes.'},
  {id:'or',name:'Or',price:99,description:'Pour profiter de l’accompagnement le plus complet.'}
];

export default function ProPlanChoice({value='none',onSelected}){
  const[busy,setBusy]=useState('');const[error,setError]=useState('');
  const select=async id=>{setBusy(id);setError('');try{const user=await base44.auth.updateMe({subscription_plan:id,subscription_status:'inactive'});onSelected?.(user)}catch(err){setError(err.message||'Choix impossible')}finally{setBusy('')}};
  return <section className="rounded-3xl border bg-card p-6 shadow-xl"><h2 className="font-heading text-2xl font-bold">Choisissez votre formule</h2><p className="mt-2 text-sm text-muted-foreground">Indiquez la formule souhaitée pour terminer votre demande de revendication.</p><div className="mt-5 grid gap-3 md:grid-cols-3">{plans.map(plan=><button key={plan.id} type="button" onClick={()=>select(plan.id)} disabled={Boolean(busy)} className={`rounded-2xl border p-5 text-left ${value===plan.id?'border-primary bg-secondary ring-2 ring-primary':'bg-background'}`}><div className="flex items-center justify-between"><strong className="text-xl">{plan.name}</strong>{value===plan.id&&<Check className="text-primary"/>}</div><p className="mt-3 text-3xl font-bold">{plan.price} €<span className="text-xs font-normal text-muted-foreground"> / mois</span></p><p className="mt-3 text-sm text-muted-foreground">{plan.description}</p><span className="mt-4 inline-block text-sm font-bold text-primary">{busy===plan.id?'Enregistrement…':value===plan.id?'Formule choisie':'Choisir'}</span></button>)}</div>{error&&<p className="mt-3 text-sm text-destructive">{error}</p>}</section>;
}