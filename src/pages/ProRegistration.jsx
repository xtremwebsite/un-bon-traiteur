import {useEffect,useState} from 'react';
import {base44} from '@/api/base44Client';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import CatererProfileForm from '@/components/pro/CatererProfileForm';
import ProPlanChoice from '@/components/pro/ProPlanChoice';

const slugify=value=>value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export default function ProRegistration(){
  const[user,setUser]=useState(null);
  useEffect(()=>{base44.auth.me().then(setUser)},[]);
  const save=async data=>{
    const current=await base44.auth.me();
    if(!current.subscription_plan||current.subscription_plan==='none')throw new Error('Choisissez une formule avant d’envoyer votre inscription.');
    const[existing,extras]=await Promise.all([base44.entities.CatererProfile.filter({created_by_id:current.id},'-created_date',1),base44.entities.ExtraProfile.filter({created_by_id:current.id},'-created_date',1)]);
    if(existing.length){window.location.href='/profil-traiteur';return}
    if(extras.length)throw new Error('Cette adresse e-mail est déjà associée à un compte Extra.');
    let payload={...data};
    if(data.address){
      const query=[data.address,data.postal_code,data.city].filter(Boolean).join(' ');
      const response=await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=1`);
      const result=await response.json();const feature=result.features?.[0];
      if(!feature)throw new Error('Adresse introuvable.');
      payload={...payload,longitude:feature.geometry.coordinates[0],latitude:feature.geometry.coordinates[1]};
    }
    await base44.entities.CatererProfile.create({...payload,slug:`${slugify(data.business_name)}-${Date.now().toString().slice(-6)}`,status:'pending',published:false,demo:false,verified:false,profile_origin:'owner'});
    await base44.auth.updateMe({account_type:'caterer',account_status:'pending'});
    window.location.href='/profil-traiteur';
  };
  return <><Header/><main className="min-h-screen bg-primary/5 px-4 py-8"><div className="mx-auto max-w-4xl"><header className="rounded-[2rem] border bg-card/90 p-6 shadow-xl backdrop-blur-xl"><p className="font-bold text-destructive">Inscription traiteur</p><h1 className="mt-2 font-heading text-4xl font-bold">Coordonnées et formule</h1><p className="mt-3 text-muted-foreground">Renseignez les coordonnées de votre établissement et choisissez votre formule. Votre demande sera ensuite vérifiée par l’administration.</p></header>{user===null?<div className="mt-6 h-96 animate-pulse rounded-3xl bg-muted"/>:<div className="mt-6 space-y-6"><ProPlanChoice value={user.subscription_plan||'none'} onSelected={setUser}/><section className="rounded-3xl border bg-card p-6 shadow-xl"><CatererProfileForm initial={{email:user.email}} onSave={save} submitLabel="Envoyer mon inscription pour validation" initialTab="contact" contactOnly/></section></div>}</div></main><Footer/></>;
}