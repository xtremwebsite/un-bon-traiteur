import 'leaflet/dist/leaflet.css';
import {useEffect} from 'react';
import {MapContainer,TileLayer,useMap} from 'react-leaflet';
import ProExtraMarker from '@/components/extras/ProExtraMarker';

function FitProfiles({items}){const map=useMap();useEffect(()=>{const points=items.filter(item=>item.latitude!=null&&item.longitude!=null).map(item=>[item.latitude,item.longitude]);if(points.length)map.fitBounds(points,{padding:[35,35],maxZoom:11})},[items,map]);return null}
export default function ProExtraDirectoryMap({items=[]}){return <MapContainer center={[46.6,2.2]} zoom={6} scrollWheelZoom className="h-[68vh] min-h-[520px] w-full rounded-3xl border shadow-xl"><TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><FitProfiles items={items}/>{items.filter(item=>item.latitude!=null&&item.longitude!=null).map(item=><ProExtraMarker key={item.id} item={item}/>)}</MapContainer>;}