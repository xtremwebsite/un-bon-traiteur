import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import ProCrmNav from '@/components/pro/ProCrmNav';
import OpportunityFilters from '@/components/pro/OpportunityFilters';
import OpportunityList from '@/components/pro/OpportunityList';
import OpportunityMap from '@/components/pro/OpportunityMap';
import OpportunityTabs from '@/components/pro/OpportunityTabs';

const distance=(a,b,c,d)=>{const r=6371,p=Math.PI/180,x=(c-a)*p,y=(d-b)*p;const h=Math.sin(x/2)**2+Math.cos(a*p)*Math.cos(c*p)*Math.sin(y/2)**2;return 2*r*Math.asin(Math.sqrt(h))};
export default function ProOpportunities(){
  const[data,setData]=useState({items:[],history:[],subscribed:false,profile:null});const[loading,setLoading]=useState(true);const[filters,setFilters]=useState({search:'',kind:'all',eventType:'all',radius:20});const[selectedKey,setSelectedKey]=useState(()=>new URLSearchParams(window.location.search).get('opportunity')||'');const[activeTab,setActiveTab]=useState('nearby');
  const load=()=>base44.functions.invoke('proOpportunityFeed',{}).then(response=>setData(response.data)).finally(()=>setLoading(false));
  useEffect(()=>{load()},[]);
  const origin=Number.isFinite(Number(data.profile?.latitude))&&Number.isFinite(Number(data.profile?.longitude))?[Number(data.profile.latitude),Number(data.profile.longitude)]:[46.6,2.2];
  const sourceItems=activeTab==='history'?(data.history||[]):data.items;
  const items=useMemo(()=>sourceItems.map(item=>({...item,distance:distance(origin[0],origin[1],Number(item.latitude),Number(item.longitude))})).filter(item=>(filters.kind==='all'||item.kind===filters.kind)&&(filters.eventType==='all'||item.event_type===filters.eventType)&&(activeTab==='history'||item.distance<=filters.radius)&&`${item.location} ${item.event_type}`.toLowerCase().includes(filters.search.toLowerCase())),[sourceItems,filters,activeTab,origin[0],origin[1]]);
  const eventTypes=[...new Set([...data.items,...(data.history||[])].map(item=>item.event_type).filter(Boolean))].sort();
  if(loading)return <div className="min-h-screen animate-pulse bg-muted"/>;
  return <><Header/><main className="min-h-screen bg-primary/5 px-4 py-8"><div className="mx-auto max-w-[1500px]"><ProCrmNav/><div className="mt-7"><p className="font-bold text-destructive">Espace professionnel privé</p><h1 className="mt-2 font-heading text-4xl font-bold">Autour de moi</h1><p className="mt-2 text-muted-foreground">Demandes géolocalisées dans un rayon de 20 km autour de {data.profile?.business_name||'votre établissement'}.</p></div><div className="mt-6"><OpportunityTabs value={activeTab} historyCount={(data.history||[]).length} onChange={value=>{setActiveTab(value);setSelectedKey('')}}/></div><div className="mt-4"><OpportunityFilters filters={filters} onChange={setFilters} eventTypes={eventTypes}/></div><div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]"><OpportunityMap items={items} subscribed={data.subscribed} center={origin} selectedKey={selectedKey} onSelect={setSelectedKey}/><OpportunityList items={items} subscribed={data.subscribed} selectedKey={selectedKey} onSelect={setSelectedKey} onResponded={load}/></div></div></main><Footer/></>;
}