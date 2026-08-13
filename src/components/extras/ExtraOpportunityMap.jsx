import 'leaflet/dist/leaflet.css';
import {useEffect} from 'react';
import {MapContainer,TileLayer,useMap} from 'react-leaflet';
import ExtraOpportunityMarker from '@/components/extras/ExtraOpportunityMarker';

function FitAnnouncements({items,location}){const map=useMap();useEffect(()=>{const points=items.filter(item=>item.latitude!=null&&item.longitude!=null).map(item=>[item.latitude,item.longitude]);const center=location?.latitude!=null&&location?.longitude!=null?[location.latitude,location.longitude]:null;if(center)points.push(center);if(points.length>1)map.fitBounds(points,{padding:[40,40],maxZoom:12});else if(center)map.setView(center,11);else if(points.length)map.setView(points[0],11)},[items,location?.latitude,location?.longitude,map]);return null}
export default function ExtraOpportunityMap({items=[],location,onView,onApply}){
  return <div><MapContainer center={[46.6,2.2]} zoom={6} scrollWheelZoom className="h-[62vh] min-h-[480px] w-full rounded-3xl border shadow-xl lg:h-[calc(100vh-230px)] lg:min-h-[520px]"><TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><FitAnnouncements items={items} location={location}/>{items.filter(item=>item.latitude!=null&&item.longitude!=null).map(item=><ExtraOpportunityMarker key={item.id} item={item} onView={onView} onApply={onApply}/>)}</MapContainer></div>;
}