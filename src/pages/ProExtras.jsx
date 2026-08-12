import {useEffect,useState} from 'react';
import {useLocation} from 'react-router-dom';
import {base44} from '@/api/base44Client';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import ProExtrasNav from '@/components/extras/ProExtrasNav';
import ProExtraPublishPanel from '@/components/extras/ProExtraPublishPanel';
import ProExtraSearchPanel from '@/components/extras/ProExtraSearchPanel';
import ProCrmNav from '@/components/pro/ProCrmNav';
import {distanceKm} from '@/lib/distance';

export default function ProExtras(){
  const{search:locationSearch}=useLocation();const mode=new URLSearchParams(locationSearch).get('mode')==='search'?'search':'publish';const[data,setData]=useState({items:[],requests:[],bookings:[]});const[loading,setLoading]=useState(true);const[error,setError]=useState('');const[editing,setEditing]=useState(null);const[result,setResult]=useState(null);
  const load=()=>base44.functions.invoke('extrasHub',{action:'directory'}).then(response=>setData(response.data)).catch(err=>setError(err.response?.data?.error||err.message)).finally(()=>setLoading(false));
  useEffect(()=>{load()},[]);useEffect(()=>{const params=new URLSearchParams(locationSearch);const id=params.get('edit_request');if(id&&data.requests.length&&!editing)setEditing(data.requests.find(item=>item.id===id)||null);const extraId=params.get('extra');if(extraId&&data.items.length)setTimeout(()=>document.getElementById(`extra-${extraId}`)?.scrollIntoView({behavior:'smooth',block:'center'}),100)},[locationSearch,data.requests,data.items,editing]);
  useEffect(()=>base44.entities.ExtraBooking.subscribe(event=>setData(current=>({...current,bookings:event.type==='delete'?(current.bookings||[]).filter(item=>item.id!==event.id):(current.bookings||[]).some(item=>item.id===event.id)?current.bookings.map(item=>item.id===event.id?event.data:item):[event.data,...(current.bookings||[])]}))),[]);
  const matchingCount=form=>data.items.filter(item=>(item.skills||[]).includes(form.role)&&((item.availability_dates||[]).includes(form.event_date)||(item.availability_slots||[]).some(slot=>slot.date===form.event_date))&&(form.latitude==null||form.longitude==null||(item.latitude!=null&&item.longitude!=null&&distanceKm({latitude:Number(form.latitude),longitude:Number(form.longitude)},{latitude:item.latitude,longitude:item.longitude})<=Number(form.radius_km||15)))).length;
  const saveRequest=async form=>{const isEditing=Boolean(editing);await base44.functions.invoke('extrasHub',{action:isEditing?'update_request':'create_request',request_id:editing?.id,data:form});if(!isEditing)setResult({count:matchingCount(form),role:form.role,date:form.event_date});setEditing(null);await load()};
  const deleteRequest=async item=>{if(!window.confirm('Supprimer cette annonce publiée ? Les candidatures en cours seront annulées.'))return;await base44.functions.invoke('extrasHub',{action:'delete_request',request_id:item.id});if(editing?.id===item.id)setEditing(null);await load()};
  const book=async form=>{await base44.functions.invoke('extrasHub',{action:'book_extra',data:form});await load()};const recommend=async form=>{await base44.functions.invoke('extrasHub',{action:'recommend',data:form});await load()};const contact=form=>base44.functions.invoke('extrasHub',{action:'contact',data:form});const trackView=extra=>base44.functions.invoke('extrasHub',{action:'view_profile',profile_id:extra.id});
  if(loading)return <div className="min-h-screen animate-pulse bg-muted"/>;
  return <><Header/><main className="min-h-screen bg-primary/5 px-4 py-9"><div className="mx-auto max-w-7xl"><ProCrmNav/><p className="mt-7 text-sm font-bold uppercase tracking-widest text-destructive">Réservé aux traiteurs</p><h1 className="mt-2 font-heading text-4xl font-bold">Recruter des Extras</h1><ProExtrasNav/>{error?<div className="mt-6 rounded-2xl border bg-card p-6 text-destructive">{error}</div>:mode==='publish'?<ProExtraPublishPanel editing={editing} result={result} requests={data.requests} bookings={data.bookings||[]} onSubmit={saveRequest} onCancel={()=>setEditing(null)} onEdit={item=>{setEditing(item);window.scrollTo({top:0,behavior:'smooth'})}} onDelete={deleteRequest}/>:<ProExtraSearchPanel items={data.items} onBook={book} onRecommend={recommend} onContact={contact} onView={trackView}/>}</div></main><Footer/></>;
}