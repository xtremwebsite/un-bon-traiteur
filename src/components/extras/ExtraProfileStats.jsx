import {CheckCircle2,Eye} from 'lucide-react';

export default function ExtraProfileStats({views=0,bookings=[]}){
  const confirmed=bookings.filter(item=>item.status==='confirmed').length;
  return <section className="rounded-3xl border bg-card p-5 shadow-lg"><p className="text-xs font-bold uppercase tracking-widest text-destructive">Performance du profil</p><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-secondary/50 p-3"><Eye className="text-primary" size={19}/><p className="mt-2 text-2xl font-bold">{views}</p><p className="text-xs text-muted-foreground">Vues de la fiche</p></div><div className="rounded-2xl bg-secondary/50 p-3"><CheckCircle2 className="text-primary" size={19}/><p className="mt-2 text-2xl font-bold">{confirmed}</p><p className="text-xs text-muted-foreground">Demandes validées</p></div></div></section>;
}