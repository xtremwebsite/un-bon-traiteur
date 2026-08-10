import {Clock3,MapPin} from 'lucide-react';

export default function OpportunityTabs({value,onChange,historyCount}){
  const style=active=>`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${active?'bg-primary text-primary-foreground':'text-muted-foreground hover:bg-secondary'}`;
  return <div className="inline-flex rounded-2xl border bg-card p-1 shadow-sm" role="tablist" aria-label="Opportunités"><button type="button" role="tab" aria-selected={value==='nearby'} onClick={()=>onChange('nearby')} className={style(value==='nearby')}><MapPin size={16}/>À proximité</button><button type="button" role="tab" aria-selected={value==='history'} onClick={()=>onChange('history')} className={style(value==='history')}><Clock3 size={16}/>Historique <span className="rounded-full bg-background/20 px-2 py-0.5 text-xs">{historyCount}</span></button></div>;
}