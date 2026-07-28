import { MapPin } from 'lucide-react';

export default function CatererLocalSeo({ item }) {
  const areas = item.service_areas?.length ? item.service_areas : [item.city].filter(Boolean);
  if (!item.geo_summary && !areas.length) return null;
  return <section className="mt-10 rounded-3xl border bg-card p-7 shadow-sm md:p-9"><p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-destructive"><MapPin size={16}/>Zone d’intervention</p><h2 className="mt-2 font-heading text-2xl font-bold">Traiteur à {item.city} et aux alentours</h2>{item.geo_summary&&<p className="mt-4 leading-7 text-muted-foreground">{item.geo_summary}</p>}{areas.length>0&&<div className="mt-5 flex flex-wrap gap-2">{areas.map(area=><span key={area} className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-primary">{area}</span>)}</div>}</section>;
}