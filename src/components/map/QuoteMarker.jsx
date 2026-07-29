import { divIcon } from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { FileText, LockKeyhole } from 'lucide-react';

const icon = divIcon({ className:'quote-marker-shell', html:renderToStaticMarkup(<span className="quote-map-pin"><FileText aria-hidden="true"/></span>), iconSize:[48,54], iconAnchor:[24,50], popupAnchor:[0,-46] });

export default function QuoteMarker({ item, subscribed }) {
  const date=new Date(`${item.event_date}T12:00:00`).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});
  return <Marker position={[item.latitude,item.longitude]} icon={icon}><Popup minWidth={260}><p className="font-bold text-primary">Demande de devis</p><h3 className="mt-1 text-base font-bold">{item.event_type}</h3><p className="mt-2 text-sm">{date} · {item.guest_count} invités<br/>{item.location}{item.budget?` · ${item.budget} €`:''}</p>{subscribed?<div className="mt-3 border-t pt-3 text-sm"><p>{item.message||'Aucune précision supplémentaire.'}</p><p className="mt-2 font-semibold">{item.first_name} {item.last_name}</p><a className="block text-primary underline" href={`mailto:${item.email}`}>{item.email}</a>{item.phone&&<a className="block text-primary underline" href={`tel:${item.phone}`}>{item.phone}</a>}</div>:<p className="mt-3 flex gap-2 rounded-lg bg-muted p-3 text-sm"><LockKeyhole size={16}/>Coordonnées réservées aux abonnés.</p>}</Popup></Marker>;
}