import 'leaflet/dist/leaflet.css';
import {useEffect} from 'react';
import {MapContainer,TileLayer,useMap} from 'react-leaflet';
import ExtraOpportunityMarker from '@/components/extras/ExtraOpportunityMarker';

function FitAnnouncements({items}){const map=useMap();useEffect(()=>{const points=items.filter(item=>item.latitude!=null&&item.longitude!=null).map(item=>[item.latitude,item.longitude]);if(points.length)map.fitBounds(points,{padding:[40,40],maxZoom:12})},[items,map]);return null}
export default function ExtraOpportunityMap({items=[]}){
  return <div className="lg:sticky lg:top-24"><MapContainer center={[46.6,2.2]} zoom={6} scrollWheelZoom className="h-[62vh] min-h-[480px] w-full rounded-3xl border shadow-xl"><TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><FitAnnouncements items={items}/>{items.filter(item=>item.latitude!=null&&item.longitude!=null).map(item=><ExtraOpportunityMarker key={item.id} item={item}/>)}</MapContainer></div>;
}