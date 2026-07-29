export default function ExtraPrivacyFields({data,set}) {
  const choices=[['display_last_name','Afficher mon nom de famille'],['display_email','Afficher mon email'],['display_phone','Afficher mon téléphone']];
  return <section className="space-y-4 rounded-2xl border bg-secondary/50 p-4">
    <div><h2 className="text-lg font-bold">Confidentialité et premier contact</h2><p className="mt-1 font-normal text-muted-foreground">L’adresse, la date de naissance et les coordonnées masquées ne sont jamais affichées aux traiteurs.</p></div>
    <label className="block">Premier contact préféré<select value={data.contact_preference||'site'} onChange={set('contact_preference')} className="mt-1 h-11 w-full rounded-xl border bg-background px-3"><option value="site">Formulaire confidentiel du site</option><option value="email">Email direct, si je choisis de l’afficher</option></select></label>
    <div className="grid gap-2 sm:grid-cols-3">{choices.map(([key,label])=><label key={key} className="flex items-start gap-2 rounded-xl bg-card p-3"><input type="checkbox" checked={Boolean(data[key])} onChange={set(key)} className="mt-1"/><span>{label}</span></label>)}</div>
  </section>;
}