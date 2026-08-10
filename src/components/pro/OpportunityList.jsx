import {useEffect,useMemo} from 'react';
import OpportunityCard from '@/components/pro/OpportunityCard';

export default function OpportunityList({items,subscribed,selectedKey,onSelect,onResponded}){
  const ordered=useMemo(()=>selectedKey?[...items].sort((a,b)=>`${a.kind}:${a.id}`===selectedKey?-1:`${b.kind}:${b.id}`===selectedKey?1:0):items,[items,selectedKey]);
  useEffect(()=>{if(selectedKey)document.getElementById(`opportunity-${selectedKey.replace(':','-')}`)?.scrollIntoView({behavior:'smooth',block:'start'})},[selectedKey]);
  return <aside className="max-h-[680px] space-y-3 overflow-y-auto pr-1">{ordered.map(item=>{const key=`${item.kind}:${item.id}`;return <OpportunityCard key={key} item={item} subscribed={subscribed} selected={key===selectedKey} onSelect={()=>onSelect(key)} onResponded={onResponded}/>})}{!items.length&&<div className="rounded-3xl border bg-card p-8 text-center text-muted-foreground">Aucune demande ne correspond à ces filtres.</div>}</aside>;
}