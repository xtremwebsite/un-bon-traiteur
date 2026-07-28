import { useState } from 'react';
import { CircleMarker, Popup, useMap } from 'react-leaflet';
import { Crosshair, LoaderCircle } from 'lucide-react';

export default function GeolocationButton() {
  const map = useMap();
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const locate = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const next = [coords.latitude, coords.longitude];
      setPosition(next); map.flyTo(next, 12); setLoading(false);
    }, () => { setLoading(false); window.alert('Votre position n’a pas pu être obtenue. Vérifiez l’autorisation de géolocalisation.'); });
  };
  return <><button type="button" onClick={locate} disabled={loading} aria-label="Me géolocaliser" className="absolute right-3 top-3 z-[500] grid h-11 w-11 place-items-center rounded-xl border bg-card text-primary shadow-lg hover:bg-secondary disabled:opacity-60">{loading ? <LoaderCircle className="h-5 w-5 animate-spin"/> : <Crosshair className="h-5 w-5"/>}</button>{position && <CircleMarker center={position} radius={8} pathOptions={{ color: 'hsl(0 0% 100%)', fillColor: 'hsl(217 91% 60%)', fillOpacity: 1, weight: 3 }}><Popup>Vous êtes ici</Popup></CircleMarker>}</>;
}