import {LogOut} from 'lucide-react';
import {base44} from '@/api/base44Client';
export default function LogoutButton({className=''}){return <button type="button" onClick={()=>base44.auth.logout('/')} className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${className}`}><LogOut size={16}/>Se déconnecter</button>;}