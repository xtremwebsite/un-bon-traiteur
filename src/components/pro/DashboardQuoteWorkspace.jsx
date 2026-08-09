import {useEffect,useState} from 'react';
import {CalendarDays,Columns3} from 'lucide-react';
import {base44} from '@/api/base44Client';
import QuoteKanbanBoard from '@/components/pro/QuoteKanbanBoard';
import ResourcePlanning from '@/components/pro/ResourcePlanning';
import QuoteConversationDialog from '@/components/quotes/QuoteConversationDialog';

export default function DashboardQuoteWorkspace(){
  const[data,setData]=useState({items:[],bookings:[]});const[view,setView]=useState('pipeline');const[selected,setSelected]=useState(null);const[loading,setLoading]=useState(true);
  const load=()=>base44.functions.invoke('quoteConversation',{action:'list_professional'}).then(r=>setData({items:r.data.items||[],bookings:r.data.bookings||[]})).finally(()=>setLoading(false));
  useEffect(()=>{load()},[]);const changed=item=>{setData(current=>({...current,items:current.items.map(x=>x.id===item.id?item:x)}));setSelected(item)};
  if(loading)return <div className="h-72 animate-pulse rounded-3xl bg-muted"/>;
  return <section id="demandes" className="scroll-mt-24 space-y-5"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-destructive">Pilotage commercial</p><h2 className="font-heading text-3xl font-bold">Devis & planning</h2><p className="mt-1 text-sm text-muted-foreground">Suivez chaque demande, chaque échange et les ressources mobilisées.</p></div><div className="flex rounded-xl border bg-card p-1"><button onClick={()=>setView('pipeline')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${view==='pipeline'?'bg-primary text-primary-foreground':''}`}><Columns3 size={16}/>Pipeline</button><button onClick={()=>setView('planning')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${view==='planning'?'bg-primary text-primary-foreground':''}`}><CalendarDays size={16}/>Planning ressources</button></div></div>{view==='pipeline'?<QuoteKanbanBoard items={data.items} onOpen={setSelected} onChanged={changed}/>:<ResourcePlanning items={data.items} bookings={data.bookings} onOpen={setSelected}/>} {selected&&<QuoteConversationDialog quote={selected} onClose={()=>setSelected(null)} onChanged={changed}/>}</section>;
}