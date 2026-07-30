import OpportunityCard from '@/components/pro/OpportunityCard';

export default function OpportunityList({items,subscribed}){
  return <aside className="max-h-[680px] space-y-3 overflow-y-auto pr-1">{items.map(item=><OpportunityCard key={`${item.kind}-${item.id}`} item={item} subscribed={subscribed}/>)}{!items.length&&<div className="rounded-3xl border bg-card p-8 text-center text-muted-foreground">Aucune demande ne correspond à ces filtres.</div>}</aside>;
}