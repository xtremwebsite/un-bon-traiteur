import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import CatererCard from '@/components/site/CatererCard';
import SearchFilters from '@/components/search/SearchFilters';

const distance = (a, b) => {
  const r = 6371;
  const dLat = (b.latitude - a.latitude) * Math.PI / 180;
  const dLon = (b.longitude - a.longitude) * Math.PI / 180;
  const v = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * Math.PI / 180) * Math.cos(b.latitude * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(v));
};

const initial = () => {
  const p = new URLSearchParams(window.location.search);
  return { city: p.get('location') || '', event: p.get('event') || '', maxPrice: '', rating: '', verified: false, geo: null, radius: '50' };
};

export default function Search() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initial);
  const [sort, setSort] = useState('recommended');
  const [geoError, setGeoError] = useState('');
  useEffect(() => { base44.entities.CatererProfile.filter({ published: true }, '-updated_date', 100).then(setItems).finally(() => setLoading(false)); }, []);
  const events = useMemo(() => [...new Set(items.flatMap(x => x.event_types || []))].sort(), [items]);
  const shown = useMemo(() => {
    const city = filters.city.trim().toLowerCase();
    const result = items.filter(x => (!city || `${x.city} ${x.postal_code || ''}`.toLowerCase().includes(city)) && (!filters.event || (x.event_types || []).includes(filters.event)) && (!filters.maxPrice || x.price_from_per_person <= Number(filters.maxPrice)) && (!filters.rating || (x.google_rating || 0) >= Number(filters.rating)) && (!filters.verified || x.verified) && (!filters.geo || (x.latitude && x.longitude && distance(filters.geo, x) <= Number(filters.radius))));
    return [...result].sort((a, b) => sort === 'price' ? a.price_from_per_person - b.price_from_per_person : sort === 'rating' ? (b.google_rating || 0) - (a.google_rating || 0) : sort === 'recent' ? new Date(b.updated_date) - new Date(a.updated_date) : Number(b.verified) - Number(a.verified) || (b.google_rating || 0) - (a.google_rating || 0));
  }, [items, filters, sort]);
  const locate = () => {
    setGeoError('');
    if (!navigator.geolocation) return setGeoError('La géolocalisation n’est pas disponible sur cet appareil.');
    navigator.geolocation.getCurrentPosition(p => setFilters(current => ({ ...current, geo: { latitude: p.coords.latitude, longitude: p.coords.longitude } })), () => setGeoError('Position indisponible. Autorisez la géolocalisation dans votre navigateur.'));
  };
  const reset = () => { setFilters({ city: '', event: '', maxPrice: '', rating: '', verified: false, geo: null, radius: '50' }); setGeoError(''); };
  return <><Header/><main className="mx-auto max-w-7xl px-4 py-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-muted-foreground">Comparez les professionnels selon vos critères</p><h1 className="font-heading text-3xl font-bold">Traiteurs disponibles</h1></div><select value={sort} onChange={e => setSort(e.target.value)} className="h-11 rounded-lg border bg-background px-3" aria-label="Trier"><option value="recommended">Recommandés</option><option value="price">Prix croissant</option><option value="rating">Mieux notés</option><option value="recent">Nouveautés</option></select></div><div className="mt-8 grid gap-8 lg:grid-cols-[290px_1fr]"><SearchFilters filters={filters} setFilters={setFilters} events={events} onLocate={locate} geoError={geoError} onReset={reset}/><section><p className="mb-5 text-sm font-medium">{shown.length} résultat{shown.length !== 1 ? 's' : ''}</p>{loading ? <div className="grid gap-5 md:grid-cols-2"><div className="h-80 animate-pulse rounded-2xl bg-muted"/><div className="h-80 animate-pulse rounded-2xl bg-muted"/></div> : shown.length ? <div className="grid gap-5 md:grid-cols-2">{shown.map(x => <CatererCard key={x.id} caterer={x}/>)}</div> : <div className="rounded-2xl border p-10 text-center"><h2 className="text-xl font-bold">Aucun résultat</h2><p className="mt-2 text-muted-foreground">Élargissez le rayon ou retirez certains filtres.</p></div>}</section></div></main><Footer/></>;
}