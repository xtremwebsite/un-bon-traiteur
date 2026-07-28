const tabs = [
  ['overview', 'Vue d’ensemble'],
  ['professionals', 'Professionnels'],
  ['users', 'Particuliers'],
  ['subscriptions', 'Abonnements & tarifs'],
  ['requests', 'Demandes'],
  ['reviews', 'Avis'],
];

export default function AdminTabs({ active, onChange }) {
  return <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Sections du back-office">
    {tabs.map(([key, label]) => <button key={key} type="button" onClick={() => onChange(key)} className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold ${active === key ? 'bg-primary text-primary-foreground' : 'border bg-card'}`}>{label}</button>)}
  </nav>;
}