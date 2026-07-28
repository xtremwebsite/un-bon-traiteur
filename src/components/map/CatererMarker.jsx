import { divIcon } from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Utensils } from 'lucide-react';

const catererIcon = divIcon({
  className: 'caterer-marker-shell',
  html: renderToStaticMarkup(<span className="caterer-map-pin"><Utensils aria-hidden="true"/></span>),
  iconSize: [44, 50], iconAnchor: [22, 47], popupAnchor: [0, -43]
});

export default function CatererMarker({ item }) {
  const destination = item.address ? `${item.address}, ${item.postal_code || ''} ${item.city}` : `${item.latitude},${item.longitude}`;
  return <Marker position={[item.latitude, item.longitude]} icon={catererIcon}><Popup><strong>{item.business_name}</strong><br/>{item.address && <><span>{item.address}</span><br/></>}<span>{item.postal_code} {item.city}</span><div className="mt-3 flex gap-2"><a href={`/traiteurs/${item.slug}`} className="font-semibold text-primary">Voir la fiche</a><a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`} target="_blank" rel="noreferrer" className="font-semibold text-primary">M’y rendre</a></div></Popup></Marker>;
}