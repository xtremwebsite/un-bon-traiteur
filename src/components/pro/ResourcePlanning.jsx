import {useState} from 'react';
import {addMonths,addWeeks,endOfMonth,endOfWeek,startOfMonth,startOfWeek} from 'date-fns';
import {buildResourceDays} from '@/lib/staffPlanning';
import PlanningPeriodControls from '@/components/pro/PlanningPeriodControls';
import ResourceDayCard from '@/components/pro/ResourceDayCard';

export default function ResourcePlanning({items,bookings,assignments=[],internalStaffCount=0,onOpen}){
  const[view,setView]=useState('week');const[anchor,setAnchor]=useState(new Date());const allDays=buildResourceDays(items,bookings,internalStaffCount,assignments);
  const start=view==='week'?startOfWeek(anchor,{weekStartsOn:1}):startOfMonth(anchor);const end=view==='week'?endOfWeek(anchor,{weekStartsOn:1}):endOfMonth(anchor);const days=allDays.filter(day=>{const date=new Date(`${day.date}T12:00:00`);return date>=start&&date<=end});
  const label=view==='week'?`Semaine du ${start.toLocaleDateString('fr-FR',{day:'numeric',month:'long'})} au ${end.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}`:anchor.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});const shift=direction=>setAnchor(current=>view==='week'?addWeeks(current,direction):addMonths(current,direction));
  return <div><PlanningPeriodControls view={view} label={label} onView={setView} onPrevious={()=>shift(-1)} onNext={()=>shift(1)} onToday={()=>setAnchor(new Date())}/><div className="space-y-3">{days.map(day=><ResourceDayCard key={day.date} day={day} onOpen={onOpen}/>)}{!days.length&&<div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">Aucune prestation sur cette période. Utilisez les flèches pour consulter l’historique.</div>}</div></div>;
}