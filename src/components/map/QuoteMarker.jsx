import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { divIcon } from 'leaflet';
import { Marker, Popup, useMap } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { FileText, LockKeyhole } from 'lucide-react';

const buildIcon=selected=>divIcon({className:'quote-marker-shell',html:renderToStaticMarkup(<span className={`quote-map-pin ${selected?'quote-map-pin--selected':''}`}><FileText aria-hidden="true"/></span>),iconSize:[48,54],iconAnchor:[24,50],popupAnchor:[0,-46]});

export default function QuoteMarker({item,subscribed,selected,onSelect}) {
  const date=new Date(`${item.event_date}T12:00:00`).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});const marker=useRef(null);const map=useMap();const navigate=useNavigate();const icon=useMemo(()=>buildIcon(selected),[selected]);const respond=event=>{event.stopPropagation();if(onSelect)onSelect();else navigate(`/opportunites-pro?opportunity=quote:${item.id}`)};
  useEffect(()=>{if(selected){marker.current?.openPopup();map.panTo([item.latitude,item.longitude])}},[selected]);
  return <Marker ref={marker} position={[item.latitude,item.longitude]} icon={icon} zIndexOffset={selected?1000:0} eventHandlers={{click:onSelect}}><Popup minWidth={260}><p className="font-bold text-primary">Demande de devis</p><h3 className="mt-1 text-base font-bold">{item.event_type}</h3><p className="mt-2 text-sm">{date} · {item.guest_count} invités<br/>{item.location}{item.budget?` · ${item.budget} €`:''}</p>{subscribed?<div className="mt-3 border-t pt-3 text-sm"><p>{item.message||'Aucune précision supplémentaire.'}</p><p className="mt-2 text-xs font-semibold text-muted-foreground">Coordonnées du demandeur confidentielles.</p></div>:<p className="mt-3 flex gap-2 rounded-lg bg-muted p-3 text-sm"><LockKeyhole size={16}/>Réponse réservée aux abonnés.</p>}<button type="button" onClick={respond} className="mt-3 w-full rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground">Voir et répondre</button></Popup></Marker>;
}