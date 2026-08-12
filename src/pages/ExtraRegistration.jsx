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
import ExtraSubscriptionCard from '@/components/extras/ExtraSubscriptionCard';
import ExtraPlanningPanel from '@/components/extras/ExtraPlanningPanel';
import ExtraProfileStats from '@/components/extras/ExtraProfileStats';
import ExtraMissionHistory from '@/components/extras/ExtraMissionHistory';

export default function ExtraRegistration(){
  const[user,setUser]=useState();const[profile,setProfile]=useState();const[bookings,setBookings]=useState([]);const[views,setViews]=useState(0);const[loading,setLoading]=useState(true);const[tab,setTab]=useState('dashboard');
  useEffect(()=>{base44.auth.me().then(async current=>{setUser(current);const[items,bookingItems]=await Promise.all([base44.entities.ExtraProfile.filter({created_by_id:current.id},'-created_date',1),base44.entities.ExtraBooking.filter({extra_user_id:current.id},'-booking_date',200)]);const found=items[0]||null;setProfile(found);setBookings(bookingItems);if(!found)setTab('profile');if(found){const stats=await base44.functions.invoke('extrasHub',{action:'profile_stats',profile_id:found.id});setViews(stats.data.views||0)}}).finally(()=>setLoading(false))},[]);
  useEffect(()=>base44.entities.ExtraBooking.subscribe(event=>setBookings(current=>event.type==='delete'?current.filter(item=>item.id!==event.id):current.some(item=>item.id===event.id)?current.map(item=>item.id===event.id?event.data:item):[event.data,...current])),[]);
  const bookingAction=async(action,item,status)=>{if(action!=='respond_booking'&&!window.confirm(action==='cancel_booking'?'Confirmer l’annulation de cette demande ?':'Supprimer définitivement cette demande ?'))return;const response=await base44.functions.invoke('extrasHub',{action,booking_id:item.id,status});if(action==='delete_booking')setBookings(current=>current.filter(x=>x.id!==item.id));else setBookings(current=>current.map(x=>x.id===item.id?response.data.item:x))};
  if(loading)return <div className="min-h-screen animate-pulse bg-muted"/>;
  if(profile?.status==='pending')return <ExtraPendingApproval/>;
  return <><Header/><main className="min-h-screen bg-primary/5 px-4 py-8"><div className="mx-auto max-w-7xl"><header className="rounded-2xl border bg-card/90 px-4 py-3 shadow-lg backdrop-blur-xl sm:px-5 sm:py-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold text-destructive">Studio Extra</p><h1 className="font-heading text-xl font-bold sm:text-2xl">Tableau de bord Extra</h1></div><LogoutButton className="shrink-0 text-muted-foreground hover:bg-secondary"/></div></header><div className="mt-4 grid items-start gap-6 lg:grid-cols-[190px_minmax(0,1fr)_280px]"><ExtraDashboardSidebar active={tab} onChange={setTab}/><section className="order-2 min-w-0 space-y-6">{tab==='dashboard'&&<><ExtraBookingInbox items={bookings} onRespond={(item,status)=>bookingAction('respond_booking',item,status)} onCancel={item=>bookingAction('cancel_booking',item)} onDelete={item=>bookingAction('delete_booking',item)}/><ExtraPlanningPanel bookings={bookings}/></>}{tab==='profile'&&<div className="rounded-3xl border bg-card p-4 shadow-xl sm:p-6"><h2 className="text-2xl font-bold">État civil et profil</h2><p className="mb-6 mt-2 text-sm text-muted-foreground">Modifiez ici vos informations personnelles, vos compétences et vos disponibilités.</p><ExtraProfileForm key={profile?.updated_date||'new'} initial={profile} user={user} bookings={bookings} onSaved={async saved=>{setProfile(saved);await base44.auth.updateMe({account_type:'extra'})}}/></div>}{tab==='history'&&<ExtraMissionHistory bookings={bookings}/>}</section><aside className="order-3 space-y-4 lg:sticky lg:top-24"><ExtraSubscriptionCard compact profile={profile} bookings={bookings}/>{profile?.status==='approved'&&<ExtraProfileStats views={views} bookings={bookings}/>}<ExtraProfileStatus profile={profile}/></aside></div></div></main><Footer/></>;
}