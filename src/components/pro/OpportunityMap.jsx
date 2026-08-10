import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import QuoteMarker from '@/components/map/QuoteMarker';
import UrgentMarker from '@/components/map/UrgentMarker';
import GeolocationButton from '@/components/map/GeolocationButton';

export default function OpportunityMap({items,subscribed,center,selectedKey,onSelect}) {
  return <MapContainer center={center} zoom={center[0]===46.6?6:9} scrollWheelZoom className="h-[62vh] min-h-[520px] w-full rounded-3xl shadow-xl"><TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><GeolocationButton/>{items.map(item=>{const key=`${item.kind}:${item.id}`;const props={item,subscribed,selected:key===selectedKey,onSelect:()=>onSelect(key)};return item.kind==='urgent'?<UrgentMarker key={key} {...props}/>:<QuoteMarker key={key} {...props}/>})}</MapContainer>;
}