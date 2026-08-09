import {History,Star,Users} from 'lucide-react';

export default function RegularExtraList({items=[]}){
  const extras=Object.values(items.filter(x=>x.extra_profile_id&&x.status==='confirmed').reduce((all,item)=>{
    const current=all[item.extra_profile_id]||{id:item.extra_profile_id,name:item.extra_name||'Extra',photo:item.extra_photo_url,missions:[]};current.missions.push(item);all[item.extra_profile_id]=current;return all;
  },{})).sort((a,b)=>b.missions.length-a.missions.length);
  return <section className="mt-6 rounded-3xl border bg-card p-5 shadow-lg">
    <div className="flex items-center gap-2"><Users className="text-primary"/><h2 className="text-xl font-bold">Mes Extras réguliers</h2></div>
    <p className="mt-1 text-sm text-muted-foreground">Les Extras avec lesquels vous avez déjà réalisé des missions.</p>
    {extras.length?<div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{extras.map(extra=>{
      const missions=[...extra.missions].sort((a,b)=>String(b.booking_date).localeCompare(String(a.booking_date)));
      return <article key={extra.id} className="rounded-2xl border p-4">
        <div className="flex items-center gap-3">{extra.photo?<img src={extra.photo} alt="" className="h-11 w-11 rounded-full object-cover"/>:<span className="grid h-11 w-11 place-items-center rounded-full bg-secondary font-bold">{extra.name.charAt(0)}</span>}<div><h3 className="font-bold">{extra.name}</h3><p className="flex items-center gap-1 text-xs text-muted-foreground">{missions.length>=2&&<Star size={13} className="text-chart-4"/>}{missions.length} mission(s) confirmée(s)</p></div></div>
        <p className="mt-3 flex items-center gap-1 text-xs font-bold"><History size={13}/>Historique récent</p>
        <div className="mt-2 flex flex-wrap gap-1.5">{missions.slice(0,4).map(mission=><span key={mission.id} className="rounded-full bg-secondary px-2.5 py-1 text-xs">{new Date(`${mission.booking_date}T12:00:00`).toLocaleDateString('fr-FR')}</span>)}</div>
      </article>})}</div>:<p className="mt-4 rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">Les Extras apparaîtront ici après leur première mission confirmée.</p>}
  </section>;
}