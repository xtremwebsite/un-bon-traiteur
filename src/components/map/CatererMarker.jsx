import { divIcon } from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Utensils } from 'lucide-react';
import CatererMapCard from '@/components/map/CatererMapCard';

const catererIcon = divIcon({
  className: 'caterer-marker-shell',
  html: renderToStaticMarkup(<span className="caterer-map-pin"><Utensils aria-hidden="true"/></span>),
  iconSize: [44, 50], iconAnchor: [22, 47], popupAnchor: [0, -43]
});

export default function CatererMarker({ item }) {
  return <Marker position={[item.latitude, item.longitude]} icon={catererIcon}><Popup className="caterer-bento-popup" minWidth={300} maxWidth={700}><CatererMapCard item={item}/></Popup></Marker>;
}