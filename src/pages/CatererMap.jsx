import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import CatererMapView from '@/components/map/CatererMapView';
import MapFilters from '@/components/map/MapFilters';

export default function CatererMap() {
  const [mode, setMode] = useState('all');
  const [data, setData] = useState({ caterers: [], urgent: [], subscribed: false });
  const [loading, setLoading] = useState(true);
  useEffect(() => { Promise.all([
    base44.entities.CatererProfile.filter({ published: true }, '-updated_date', 500),
    base44.functions.invoke('urgentMapFeed', {})
  ]).then(([caterers, urgent]) => setData({ caterers: caterers.filter(item => Number.isFinite(item.latitude) && Number.isFinite(item.longitude)), urgent: urgent.data.items, subscribed: urgent.data.subscribed })).finally(() => setLoading(false)); }, []);
  return <><Header/><main className="mx-auto max-w-7xl px-4 py-10"><p className="text-sm font-bold uppercase tracking-widest text-destructive">Partout en France</p><h1 className="mt-2 font-heading text-4xl font-bold">Carte des traiteurs et urgences</h1><p className="mt-3 text-muted-foreground">Affichez les professionnels référencés ou les demandes urgentes près de chez vous.</p><div className="mt-6"><MapFilters mode={mode} onChange={setMode} urgentCount={data.urgent.length}/>{loading ? <div className="h-[65vh] min-h-[480px] animate-pulse rounded-3xl bg-muted"/> : <CatererMapView mode={mode} caterers={data.caterers} urgent={data.urgent} subscribed={data.subscribed}/>}</div></main><Footer/></>;
}