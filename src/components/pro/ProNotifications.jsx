import {useEffect,useState} from 'react';
import {AlertTriangle,Check} from 'lucide-react';
import {Link} from 'react-router-dom';
import {base44} from '@/api/base44Client';

export default function ProNotifications(){
  const[items,setItems]=useState([]);
  useEffect(()=>{let unsubscribe;let userId;base44.auth.me().then(user=>{userId=user.id;return base44.entities.UserNotification.filter({target_user_id:user.id},'-created_date',20)}).then(setItems).then(()=>{unsubscribe=base44.entities.UserNotification.subscribe(event=>{if(event.data?.target_user_id!==userId)return;setItems(current=>event.type==='create'?[event.data,...current]:current.map(item=>item.id===event.id?event.data:item))})});return()=>unsubscribe?.()},[]);
  const markRead=async item=>{const updated=await base44.entities.UserNotification.update(item.id,{read_at:new Date().toISOString()});setItems(current=>current.map(value=>value.id===item.id?updated:value))};
  const unread=items.filter(item=>!item.read_at);
  if(!unread.length)return null;
  return <section className="mt-6 rounded-3xl border border-destructive/30 bg-destructive/10 p-5 shadow-sm"><div className="flex items-center gap-3"><span className="rounded-full bg-destructive p-2 text-destructive-foreground"><AlertTriangle size={20}/></span><div><p className="font-bold">Annulation Extra</p><p className="text-sm text-muted-foreground">{unread.length} alerte{unread.length>1?'s':''} à traiter</p></div></div><div className="mt-4 grid gap-3">{unread.slice(0,3).map(item=><article key={item.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-destructive">{item.title}</h2><p className="mt-1 text-sm">{item.message}</p></div><div className="flex shrink-0 gap-2"><Link to={item.link||'/suivi-extras'} onClick={()=>markRead(item)} className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground">Voir la mission</Link><button onClick={()=>markRead(item)} aria-label="Marquer comme lue" className="rounded-lg border p-2 text-primary"><Check size={18}/></button></div></article>)}</div></section>;
}