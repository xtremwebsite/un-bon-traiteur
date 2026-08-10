import {Link} from 'react-router-dom';
import {Bell,CheckCircle2,Clock3,XCircle} from 'lucide-react';
import {jobLabel} from '@/lib/hr';

const statusInfo={pending:{label:'En attente',Icon:Clock3},accepted:{label:'Accepté',Icon:CheckCircle2},declined:{label:'Refusé',Icon:XCircle},cancelled:{label:'Annulé',Icon:XCircle}};

export default function StaffAssignmentList({items=[]}){
  if(!items.length)return null;
  return <div className="mt-4 space-y-2"><p className="text-sm font-bold">Équipe enregistrée</p>{items.map(item=>{const info=statusInfo[item.status]||statusInfo.pending;const Icon=info.Icon;const name=item.assignee_type==='extra'?<Link to={`/extras-pro?extra=${item.extra_profile_id}`} target="_blank" className="font-bold text-primary underline underline-offset-2">{item.assignee_name}</Link>:<b>{item.assignee_name}</b>;return <div key={item.id} className="rounded-xl border bg-card p-3 text-sm"><div className="flex flex-wrap items-center justify-between gap-2"><span>{name} · {item.assignee_type==='extra'?'Extra':'Salarié'}</span><span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs font-bold"><Icon size={13}/>{info.label}</span></div><div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground"><span>{jobLabel(item.job_role)}</span>{item.notified_at&&<span className="flex items-center gap-1 font-bold text-primary"><Bell size={12}/>Notifié</span>}</div></div>})}</div>;
}