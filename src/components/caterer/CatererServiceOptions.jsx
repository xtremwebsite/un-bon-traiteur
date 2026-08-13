import { Check, CircleHelp, Euro } from 'lucide-react';

const labels={included:'Inclus',on_request:'Sur demande',fixed:'Prix fixe'};
export default function CatererServiceOptions({caterer}) {
  const items=(caterer.service_pricing||[]).filter(item=>(caterer.services||[]).includes(item.name));
  if(!items.length)return null;
  return <section className="mt-6 rounded-[2rem] border bg-card/80 p-6 shadow-xl backdrop-blur-2xl"><p className="text-xs font-bold uppercase tracking-widest text-destructive">Options de prestation</p><h2 className="mt-1 font-heading text-2xl font-bold">Services complémentaires</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{items.map(item=>{const Icon=item.status==='included'?Check:item.status==='fixed'?Euro:CircleHelp;return <div key={item.name} className="flex items-center gap-3 rounded-2xl border bg-background/65 p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><Icon size={18}/></span><div className="min-w-0"><strong className="block text-sm text-primary">{item.name}</strong><span className="text-xs text-muted-foreground">{item.status==='fixed'&&item.price!=null?`${Number(item.price).toLocaleString('fr-FR')} €`:labels[item.status]||'Sur demande'}</span></div></div>})}</div></section>;
}