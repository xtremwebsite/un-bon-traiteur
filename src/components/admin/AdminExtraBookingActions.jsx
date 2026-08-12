import {Check,X} from 'lucide-react';

export default function AdminExtraBookingActions({item,onRespond}){
  if(item.status!=='pending'||item.initiated_by!=='extra')return null;
  return <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={()=>onRespond(item,'confirmed')} className="flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground"><Check size={16}/>Accepter la candidature</button><button type="button" onClick={()=>onRespond(item,'declined')} className="flex items-center gap-1 rounded-xl border border-destructive px-3 py-2 text-sm font-bold text-destructive"><X size={16}/>Refuser</button></div>;
}