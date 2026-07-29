import {useEffect,useState} from 'react';
import {base44} from '@/api/base44Client';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import ExtraProfileForm from '@/components/extras/ExtraProfileForm';

export default function ExtraRegistration() {
  const [user,setUser]=useState(); const [profile,setProfile]=useState(); const [loading,setLoading]=useState(true);
  useEffect(()=>{base44.auth.me().then(async current=>{setUser(current);const items=await base44.entities.ExtraProfile.filter({created_by_id:current.id},'-created_date',1);setProfile(items[0]||null)}).finally(()=>setLoading(false))},[]);
  if(loading)return <div className="min-h-screen animate-pulse bg-muted"/>;
  return <><Header/><main className="min-h-screen bg-primary/5 px-4 py-10"><div className="mx-auto max-w-3xl rounded-[2rem] border bg-card/95 p-6 shadow-xl sm:p-10"><p className="text-sm font-bold uppercase tracking-widest text-destructive">Espace privé extras</p><h1 className="mt-2 font-heading text-4xl font-bold">{profile?'Modifier mon profil':'Créer mon profil Extra'}</h1><p className="mb-8 mt-3 text-muted-foreground">Tous les renseignements sont facultatifs. Vous décidez si votre nom, votre email et votre téléphone sont visibles ; votre adresse et votre date de naissance restent privées.</p><ExtraProfileForm initial={profile} user={user} onSaved={setProfile}/></div></main><Footer/></>;
}