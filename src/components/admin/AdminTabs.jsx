const tabs = [
  ['overview', 'Vue d’ensemble'],
  ['analytics', 'Statistiques'],
  ['professionals', 'Professionnels'],
  ['extras', 'Validation Extras'],
  ['extraBookings', 'Demandes Extras'],
  ['users', 'Particuliers'],
  ['subscriptions', 'Abonnements & tarifs'],
  ['catalogs', 'Événements & formats'],
  ['webhooks', 'Webhooks n8n'],
  ['quotes', 'Devis classiques'],
  ['urgent', 'Demandes urgentes'],
  ['reviews', 'Avis'],
];

export default function AdminTabs({ active, onChange }) {
  return <nav className="grid h-fit gap-2 rounded-3xl border bg-primary p-3 text-primary-foreground shadow-2xl lg:sticky lg:top-24" aria-label="Sections du back-office">
    {tabs.map(([key, label]) => <button key={key} type="button" onClick={() => onChange(key)} className={`w-full whitespace-nowrap rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-colors ${active === key ? 'bg-primary-foreground text-primary' : 'hover:bg-primary-foreground/15'}`}>{label}</button>)}
  </nav>;
}