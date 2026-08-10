import {useEffect,useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {Radar,Siren} from 'lucide-react';
import {base44} from '@/api/base44Client';
import OpportunityCard from '@/components/pro/OpportunityCard';

export default function DashboardOpportunities(){
  const[data,setData]=useState({items:[],subscribed:false});const[loading,setLoading]=useState(true);const[error,setError]=useState('');
  useEffect(()=>{base44.functions.invoke('proOpportunityFeed',{}).then(response=>setData(response.data)).catch(err=>setError(err.response?.data?.error||err.message)).finally(()=>setLoading(false))},[]);
  const groups=useMemo(()=>({urgent:data.items.filter(item=>item.kind==='urgent'),matching:data.items.filter(item=>item.kind==='quote')}),[data.items]);
  if(loading)return <section className="mt-6 h-72 animate-pulse rounded-3xl bg-muted"/>;
  if(error)return <section className="mt-6 rounded-3xl border bg-card p-6 text-destructive">{error}</section>;
  return <section className="mt-6 rounded-3xl border bg-card p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold uppercase tracking-widest text-destructive">Autour de moi</p><h2 className="mt-1 text-2xl font-bold">Demandes à saisir</h2></div><Link to="/opportunites-pro" className="rounded-xl border px-4 py-2 text-sm font-bold text-primary">Voir la carte</Link></div><div className="mt-5 grid gap-6 xl:grid-cols-2"><OpportunityGroup icon={Siren} title="Demandes urgentes" items={groups.urgent} subscribed={data.subscribed}/><OpportunityGroup icon={Radar} title="On cherche pour vous" items={groups.matching} subscribed={data.subscribed}/></div></section>;
}

function OpportunityGroup({icon:Icon,title,items,subscribed}){return <div><h3 className="flex items-center gap-2 text-lg font-bold"><Icon size={19} className="text-destructive"/>{title}<span className="rounded-full bg-secondary px-2 py-1 text-xs text-primary">{items.length}</span></h3><div className="mt-3 max-h-[620px] space-y-3 overflow-y-auto pr-1">{items.map(item=><OpportunityCard key={`${item.kind}-${item.id}`} item={item} subscribed={subscribed}/>)}{!items.length&&<p className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">Aucune demande dans votre zone actuellement.</p>}</div></div>}