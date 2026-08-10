import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import OpportunityFilters from '@/components/pro/OpportunityFilters';
import OpportunityList from '@/components/pro/OpportunityList';
import OpportunityMap from '@/components/pro/OpportunityMap';

const distance=(a,b,c,d)=>{const r=6371,p=Math.PI/180,x=(c-a)*p,y=(d-b)*p;const h=Math.sin(x/2)**2+Math.cos(a*p)*Math.cos(c*p)*Math.sin(y/2)**2;return 2*r*Math.asin(Math.sqrt(h))};
export default function ProOpportunities(){
  const[data,setData]=useState({items:[],subscribed:false,profile:null});const[loading,setLoading]=useState(true);const[filters,setFilters]=useState({search:'',kind:'all',eventType:'all',radius:1000});const[selectedKey,setSelectedKey]=useState('');
  useEffect(()=>{base44.functions.invoke('proOpportunityFeed',{}).then(response=>setData(response.data)).finally(()=>setLoading(false))},[]);
  const origin=Number.isFinite(Number(data.profile?.latitude))&&Number.isFinite(Number(data.profile?.longitude))?[Number(data.profile.latitude),Number(data.profile.longitude)]:[46.6,2.2];
  const items=useMemo(()=>data.items.map(item=>({...item,distance:distance(origin[0],origin[1],Number(item.latitude),Number(item.longitude))})).filter(item=>(filters.kind==='all'||item.kind===filters.kind)&&(filters.eventType==='all'||item.event_type===filters.eventType)&&item.distance<=filters.radius&&`${item.location} ${item.event_type}`.toLowerCase().includes(filters.search.toLowerCase())),[data.items,filters,origin[0],origin[1]]);
  const eventTypes=[...new Set(data.items.map(item=>item.event_type).filter(Boolean))].sort();
  if(loading)return <div className="min-h-screen animate-pulse bg-muted"/>;
  return <main className="min-h-screen bg-primary/5 px-4 py-8"><div className="mx-auto max-w-[1500px]"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-bold text-destructive">Espace professionnel privé</p><h1 className="mt-2 font-heading text-4xl font-bold">Opportunités près de vous</h1><p className="mt-2 text-muted-foreground">Devis simples et urgences géolocalisés autour de {data.profile?.business_name||'votre établissement'}.</p></div><Link to="/tableau-de-bord-traiteur" className="rounded-xl border bg-card px-4 py-3 text-sm font-bold text-primary">Retour au tableau de bord</Link></div><div className="mt-6"><OpportunityFilters filters={filters} onChange={setFilters} eventTypes={eventTypes}/></div><div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]"><OpportunityMap items={items} subscribed={data.subscribed} center={origin} selectedKey={selectedKey} onSelect={setSelectedKey}/><OpportunityList items={items} subscribed={data.subscribed} selectedKey={selectedKey} onSelect={setSelectedKey}/></div></div></main>;
}