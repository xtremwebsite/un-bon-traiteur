import 'leaflet/dist/leaflet.css';
import {useEffect} from 'react';
import {MapContainer,TileLayer,useMap} from 'react-leaflet';
import ExtraOpportunityMarker from '@/components/extras/ExtraOpportunityMarker';

function FitAnnouncements({items}){const map=useMap();useEffect(()=>{const points=items.filter(item=>item.latitude!=null&&item.longitude!=null).map(item=>[item.latitude,item.longitude]);if(points.length)map.fitBounds(points,{padding:[40,40],maxZoom:12})},[items,map]);return null}
export default function ExtraOpportunityMap({items=[],onView,onApply}){
  return <div><MapContainer center={[46.6,2.2]} zoom={6} scrollWheelZoom className="h-[62vh] min-h-[480px] w-full rounded-3xl border shadow-xl lg:h-[calc(100vh-230px)] lg:min-h-[520px]"><TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><FitAnnouncements items={items}/>{items.filter(item=>item.latitude!=null&&item.longitude!=null).map(item=><ExtraOpportunityMarker key={item.id} item={item} onView={onView} onApply={onApply}/>)}</MapContainer></div>;
}