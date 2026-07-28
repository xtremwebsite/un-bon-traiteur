import { Link } from 'react-router-dom';
import { MessageSquareText, Phone, Utensils } from 'lucide-react';
import { Image } from '@/components/ui/image';

const fallback = 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=85';

export default function CatererMapCard({ item }) {
  const destination = item.address ? `${item.address}, ${item.postal_code || ''} ${item.city}` : `${item.latitude},${item.longitude}`;
  return <article className="w-[min(86vw,660px)] rounded-[2rem] bg-primary p-3 shadow-2xl">
    <div className="grid gap-3 md:grid-cols-[0.95fr_1.05fr]">
      <div className="relative min-h-[230px] overflow-visible rounded-3xl md:min-h-[360px]"><Image src={item.hero_image || fallback} alt={`Buffet de ${item.business_name}`} className="absolute inset-0 h-full w-full rounded-3xl" fittingType="fill"/><div className="absolute -right-9 top-6 z-10 grid h-24 w-24 place-items-center overflow-hidden rounded-3xl border border-primary-foreground/40 bg-card/75 p-3 text-primary shadow-2xl backdrop-blur-xl max-md:-bottom-7 max-md:left-5 max-md:right-auto max-md:top-auto">{item.logo_url ? <Image src={item.logo_url} alt={`Logo ${item.business_name}`} className="h-full w-full" fittingType="fit"/> : <Utensils className="h-11 w-11"/>}</div></div>
      <div className="flex min-w-0 flex-col gap-3 pt-7 md:pt-0"><div className="rounded-3xl border border-primary-foreground/30 bg-primary-foreground/15 px-6 py-5 shadow-xl backdrop-blur-xl"><h3 className="break-words font-heading text-2xl font-bold text-primary-foreground md:text-3xl">{item.business_name}</h3></div><div className="flex-1 rounded-3xl border border-primary-foreground/30 bg-primary-foreground/15 px-6 py-5 text-primary-foreground shadow-xl backdrop-blur-xl"><p>{item.address}</p><p>{item.postal_code} · {item.city}</p><div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-semibold underline underline-offset-4"><Link to={`/traiteurs/${item.slug}`}>Voir la fiche</Link><a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`} target="_blank" rel="noreferrer">M’y rendre</a></div></div><div className="grid grid-cols-2 gap-3"><a href={`tel:${item.phone}`} className="flex min-h-16 items-center justify-center gap-2 rounded-3xl border border-primary-foreground/20 bg-primary-foreground/10 px-3 font-bold text-primary-foreground shadow-xl"><Phone className="h-5 w-5"/>Appeler</a><Link to={`/traiteurs/${item.slug}#devis`} className="flex min-h-16 items-center justify-center gap-2 rounded-3xl bg-secondary px-3 text-center font-bold text-primary shadow-xl"><MessageSquareText className="h-5 w-5 shrink-0"/>Demander un devis</Link></div></div>
    </div>
  </article>;
}