import {useEffect,useState} from 'react';
import {base44} from '@/api/base44Client';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import ExtraProfileForm from '@/components/extras/ExtraProfileForm';
import ExtraDashboardSidebar from '@/components/extras/ExtraDashboardSidebar';
import ExtraProfileStatus from '@/components/extras/ExtraProfileStatus';
import LogoutButton from '@/components/auth/LogoutButton';
import ExtraBookingInbox from '@/components/extras/ExtraBookingInbox';
import ExtraPendingApproval from '@/components/extras/ExtraPendingApproval';

export default function ExtraRegistration(){
  const[user,setUser]=useState();const[profile,setProfile]=useState();const[bookings,setBookings]=useState([]);const[loading,setLoading]=useState(true);
  useEffect(()=>{base44.auth.me().then(async current=>{setUser(current);const[items,bookingItems]=await Promise.all([base44.entities.ExtraProfile.filter({created_by_id:current.id},'-created_date',1),base44.entities.ExtraBooking.filter({extra_user_id:current.id},'-booking_date',200)]);setProfile(items[0]||null);setBookings(bookingItems)}).finally(()=>setLoading(false))},[]);
  useEffect(()=>base44.entities.ExtraBooking.subscribe(event=>setBookings(current=>event.type==='delete'?current.filter(item=>item.id!==event.id):current.some(item=>item.id===event.id)?current.map(item=>item.id===event.id?event.data:item):[event.data,...current])),[]);
  const bookingAction=async(action,item,status)=>{if(action!=='respond_booking'&&!window.confirm(action==='cancel_booking'?'Confirmer l’annulation de cette demande ?':'Supprimer définitivement cette demande ?'))return;const response=await base44.functions.invoke('extrasHub',{action,booking_id:item.id,status});if(action==='delete_booking')setBookings(current=>current.filter(x=>x.id!==item.id));else setBookings(current=>current.map(x=>x.id===item.id?response.data.item:x))};
  const respond=(item,status)=>bookingAction('respond_booking',item,status);
  if(loading)return <div className="min-h-screen animate-pulse bg-muted"/>;
  if(profile?.status==='pending')return <ExtraPendingApproval/>;
  return <><Header/><main className="min-h-screen bg-primary/5 px-4 py-8"><div className="mx-auto max-w-7xl"><header className="rounded-2xl border bg-card/90 px-4 py-3 shadow-lg backdrop-blur-xl sm:px-5 sm:py-4"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="text-xs font-bold text-destructive">Studio Extra</p><h1 className="font-heading text-xl font-bold sm:text-2xl">Tableau de bord Extra</h1><p className="hidden text-sm text-muted-foreground sm:block">Complétez votre identité, vos coordonnées et vos disponibilités.</p></div><LogoutButton className="shrink-0 text-muted-foreground hover:bg-secondary"/></div></header><div className="mt-4 grid items-start gap-6 lg:grid-cols-[190px_minmax(0,1fr)_310px]"><ExtraDashboardSidebar/><section className="order-2 min-w-0 space-y-6"><ExtraBookingInbox items={bookings} onRespond={respond} onCancel={item=>bookingAction('cancel_booking',item)} onDelete={item=>bookingAction('delete_booking',item)}/><div className="rounded-3xl border bg-card p-4 shadow-xl sm:p-6"><h2 className="text-2xl font-bold">{profile?'Mon profil professionnel':'Créer mon profil'}</h2><p className="mb-6 mt-2 text-sm text-muted-foreground">Les champs marqués d’un astérisque sont obligatoires. Chaque enregistrement est soumis à la validation d’un administrateur.</p><ExtraProfileForm key={profile?.updated_date||'new'} initial={profile} user={user} bookings={bookings} onSaved={async saved=>{setProfile(saved);await base44.auth.updateMe({account_type:'extra'})}}/></div></section><ExtraProfileStatus profile={profile}/></div></div></main><Footer/></>;
}