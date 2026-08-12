import {useState} from 'react';
import {Trash2} from 'lucide-react';
import {base44} from '@/api/base44Client';

export default function DeleteExtraAccountButton({className=''}){
  const[busy,setBusy]=useState(false);const[error,setError]=useState('');
  const remove=async()=>{
    if(!window.confirm('Supprimer définitivement votre compte Extra et votre profil ? Cette action est irréversible.'))return;
    setBusy(true);setError('');
    try{await base44.functions.invoke('extrasHub',{action:'delete_account',confirmation:true});await base44.auth.logout('/')}catch(err){setError(err.message||'Suppression impossible.');setBusy(false)}
  };
  return <div className={className}><button type="button" disabled={busy} onClick={remove} className="inline-flex items-center justify-center gap-2 rounded-xl border border-destructive px-3 py-2 text-sm font-semibold text-destructive disabled:opacity-50"><Trash2 size={16}/>{busy?'Suppression…':'Supprimer mon compte'}</button>{error&&<p className="mt-2 text-sm text-destructive">{error}</p>}</div>;
}