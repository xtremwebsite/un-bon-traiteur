import {CircleMarker,Popup} from 'react-leaflet';
import {BriefcaseBusiness,CalendarDays,MapPin} from 'lucide-react';
import {formatAvailabilityDate} from '@/lib/extraAvailability';

export default function ExtraOpportunityMarker({item}){
  return <CircleMarker center={[item.latitude,item.longitude]} radius={10} pathOptions={{color:'hsl(var(--primary))',fillColor:'hsl(var(--destructive))',fillOpacity:1,weight:4}}><Popup><div className="min-w-52 p-1"><p className="text-xs font-bold uppercase tracking-wide text-destructive">{item.caterer_name}</p><h3 className="mt-1 flex items-center gap-2 text-base font-bold"><BriefcaseBusiness size={16}/>{item.role}</h3><p className="mt-2 flex items-center gap-2 text-sm"><CalendarDays size={15}/>{formatAvailabilityDate(item.event_date)}</p><p className="mt-1 flex items-center gap-2 text-sm"><MapPin size={15}/>{item.location}</p><p className="mt-2 font-bold text-primary">{item.distance_km.toFixed(1)} km</p></div></Popup></CircleMarker>;
}