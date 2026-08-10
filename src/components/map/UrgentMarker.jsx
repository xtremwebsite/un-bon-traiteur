import { useEffect, useMemo, useRef } from 'react';
import { divIcon } from 'leaflet';
import { Marker, Popup, useMap } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Siren } from 'lucide-react';

const buildIcon=selected=>divIcon({className:'urgent-marker-shell',html:renderToStaticMarkup(<span className={`urgent-map-pin ${selected?'urgent-map-pin--selected':''}`}><Siren aria-hidden="true"/></span>),iconSize:[48,54],iconAnchor:[24,50],popupAnchor:[0,-46]});

export default function UrgentMarker({item,subscribed,selected,onSelect}) {
  const date = new Date(`${item.event_date}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });const marker=useRef(null);const map=useMap();const icon=useMemo(()=>buildIcon(selected),[selected]);
  useEffect(()=>{if(selected){marker.current?.openPopup();map.panTo([item.latitude,item.longitude])}},[selected]);
  return <Marker ref={marker} position={[item.latitude, item.longitude]} icon={icon} zIndexOffset={selected?1000:0} eventHandlers={{click:onSelect}}><Popup minWidth={245}>
    <p className="font-bold text-destructive">Demande urgente</p>
    <h3 className="mt-1 text-base font-bold">{item.event_type}</h3>
    <dl className="mt-2 space-y-1 text-sm"><div><dt className="inline font-semibold">Date : </dt><dd className="inline capitalize">{date}</dd></div><div><dt className="inline font-semibold">Invités : </dt><dd className="inline">{item.guest_count}</dd></div><div><dt className="inline font-semibold">Ville : </dt><dd className="inline">{item.location}</dd></div></dl>
    {subscribed ? <div className="mt-3 border-t pt-3 text-sm"><p>{item.message || 'Aucune précision supplémentaire.'}</p><p className="mt-2 text-xs font-semibold text-muted-foreground">Coordonnées du demandeur confidentielles.</p></div> : <div className="mt-3 rounded-lg bg-muted p-3 text-sm"><p className="font-semibold">Résumé anonyme</p><p className="mt-1 text-muted-foreground">Un abonnement professionnel actif est requis pour répondre.</p></div>}<button type="button" onClick={onSelect} className="mt-3 w-full rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground">Voir et répondre</button>
  </Popup></Marker>;
}