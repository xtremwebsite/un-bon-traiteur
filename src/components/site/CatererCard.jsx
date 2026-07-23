import { Link } from 'react-router-dom';
import { BadgeCheck, MapPin, Users } from 'lucide-react';

export default function CatererCard({ caterer }) {
  return <article className="overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex h-40 items-center justify-center bg-secondary text-5xl" aria-hidden="true">🍽️</div>
    <div className="p-5">
      <div className="flex items-start justify-between gap-2"><h2 className="font-heading text-xl font-bold">{caterer.business_name}</h2>{caterer.verified && <BadgeCheck className="text-primary" aria-label="Professionnel vérifié"/>}</div>
      {caterer.demo && <span className="mt-2 inline-block rounded-full bg-muted px-2 py-1 text-xs">Démonstration · non indexable</span>}
      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{caterer.description}</p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm"><span className="flex gap-1"><MapPin size={16}/>{caterer.city}</span><span className="flex gap-1"><Users size={16}/>{caterer.min_guests}–{caterer.max_guests}</span></div>
      <div className="mt-5 flex items-center justify-between"><strong>Dès {caterer.price_from_per_person} € / pers.</strong><Link className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" to={`/traiteurs/${caterer.slug}`}>Voir la fiche</Link></div>
    </div>
  </article>;
}