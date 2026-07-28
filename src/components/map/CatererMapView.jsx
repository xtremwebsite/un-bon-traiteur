import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import CatererMarker from '@/components/map/CatererMarker';
import GeolocationButton from '@/components/map/GeolocationButton';
import UrgentMarker from '@/components/map/UrgentMarker';

export default function CatererMapView({ mode, caterers, urgent, subscribed }) {
  const showCaterers = mode === 'all' || mode === 'caterers';
  const showUrgent = mode === 'all' || mode === 'urgent';
  return <MapContainer center={[46.6, 2.2]} zoom={6} scrollWheelZoom className="h-[65vh] min-h-[480px] w-full rounded-3xl shadow-xl"><TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><GeolocationButton/>{showCaterers && caterers.map(item => <CatererMarker key={item.id} item={item}/>) }{showUrgent && urgent.map(item => <UrgentMarker key={item.id} item={item} subscribed={subscribed}/>)}</MapContainer>;
}