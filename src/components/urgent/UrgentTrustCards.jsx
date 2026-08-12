import { BadgeCheck, LockKeyhole, Radio } from 'lucide-react';

const items = [
  [Radio, 'Diffusion ciblée', 'Votre besoin est transmis aux professionnels disponibles dans votre secteur.'],
  [BadgeCheck, 'Traiteurs qualifiés', 'Des professionnels référencés pour répondre à votre événement.'],
  [LockKeyhole, 'Données protégées', 'Vos coordonnées servent uniquement au traitement de votre demande.']
];

export default function UrgentTrustCards() {
  return <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">{items.map(([Icon,title,text])=><article key={title} className="rounded-2xl border border-primary-foreground/25 bg-background/10 p-4 text-primary-foreground shadow-xl backdrop-blur-xl"><Icon size={20} className="text-chart-4"/><h2 className="mt-3 text-sm font-bold">{title}</h2><p className="mt-1 text-xs leading-relaxed text-primary-foreground/75">{text}</p></article>)}</div>;
}