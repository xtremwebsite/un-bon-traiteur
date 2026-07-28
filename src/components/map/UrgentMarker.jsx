import { Link } from 'react-router-dom';
import { divIcon } from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Siren } from 'lucide-react';

const urgentIcon = divIcon({
  className: 'urgent-marker-shell',
  html: renderToStaticMarkup(<span className="urgent-map-pin"><Siren aria-hidden="true"/></span>),
  iconSize: [48, 54], iconAnchor: [24, 50], popupAnchor: [0, -46]
});

export default function UrgentMarker({ item, subscribed }) {
  const date = new Date(`${item.event_date}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  return <Marker position={[item.latitude, item.longitude]} icon={urgentIcon}><Popup minWidth={245}>
    <p className="font-bold text-destructive">Demande urgente</p>
    <h3 className="mt-1 text-base font-bold">{item.event_type}</h3>
    <dl className="mt-2 space-y-1 text-sm"><div><dt className="inline font-semibold">Date : </dt><dd className="inline capitalize">{date}</dd></div><div><dt className="inline font-semibold">Invités : </dt><dd className="inline">{item.guest_count}</dd></div><div><dt className="inline font-semibold">Ville : </dt><dd className="inline">{item.location}</dd></div></dl>
    {subscribed ? <div className="mt-3 border-t pt-3 text-sm"><p>{item.message || 'Aucune précision supplémentaire.'}</p><p className="mt-2 font-semibold">Contact : {item.first_name || 'Client'} · <a href={`tel:${item.phone}`}>{item.phone}</a></p><a className="text-primary underline" href={`mailto:${item.email}`}>{item.email}</a></div> : <div className="mt-3 rounded-lg bg-muted p-3 text-sm"><p className="font-semibold">Résumé anonyme</p><p className="mt-1 text-muted-foreground">Un abonnement professionnel actif est requis pour consulter le contact.</p><Link to="/espace-traiteur" className="mt-2 inline-block font-bold text-primary">Voir les abonnements</Link></div>}
  </Popup></Marker>;
}