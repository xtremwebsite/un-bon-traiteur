import {useEffect,useState} from 'react';
import {base44} from '@/api/base44Client';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import ExtraProfileForm from '@/components/extras/ExtraProfileForm';
import ExtraDashboardSidebar from '@/components/extras/ExtraDashboardSidebar';
import ExtraProfileStatus from '@/components/extras/ExtraProfileStatus';
import LogoutButton from '@/components/auth/LogoutButton';

export default function ExtraRegistration(){
  const[user,setUser]=useState();const[profile,setProfile]=useState();const[loading,setLoading]=useState(true);
  useEffect(()=>{base44.auth.me().then(async current=>{setUser(current);const items=await base44.entities.ExtraProfile.filter({created_by_id:current.id},'-created_date',1);setProfile(items[0]||null)}).finally(()=>setLoading(false))},[]);
  if(loading)return <div className="min-h-screen animate-pulse bg-muted"/>;
  return <><Header/><main className="min-h-screen bg-primary/5 px-4 py-8"><div className="mx-auto max-w-7xl"><header className="rounded-[2rem] border bg-card/90 p-6 shadow-xl backdrop-blur-xl"><div className="flex flex-wrap items-start justify-between gap-5"><div><p className="font-bold text-destructive">Studio Extra</p><h1 className="mt-2 font-heading text-4xl font-bold">Tableau de bord Extra</h1><p className="mt-2 text-muted-foreground">Complétez votre identité, vos coordonnées et vos disponibilités.</p></div><LogoutButton className="text-muted-foreground hover:bg-secondary"/></div></header><div className="mt-6 grid items-start gap-6 lg:grid-cols-[190px_minmax(0,1fr)_310px]"><ExtraDashboardSidebar/><section className="order-1 min-w-0 rounded-3xl border bg-card p-4 shadow-xl sm:p-6 lg:order-2"><h2 className="text-2xl font-bold">{profile?'Mon profil professionnel':'Créer mon profil'}</h2><p className="mb-6 mt-2 text-sm text-muted-foreground">Les champs marqués d’un astérisque sont obligatoires. Chaque enregistrement est soumis à la validation d’un administrateur.</p><ExtraProfileForm key={profile?.updated_date||'new'} initial={profile} user={user} onSaved={setProfile}/></section><ExtraProfileStatus profile={profile}/></div></div></main><Footer/></>;
}