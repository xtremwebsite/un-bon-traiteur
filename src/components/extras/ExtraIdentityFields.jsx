const skills=['Serveur','Chef','Commis de cuisine','Maître d’hôtel','Barman','Plongeur','Hôte / Hôtesse','Livreur','Logistique'];

export default function ExtraIdentityFields({data,set,toggleSkill}) {
  return <>
    <div className="grid gap-4 sm:grid-cols-2">
      <label>Prénom <span className="font-normal text-muted-foreground">(facultatif)</span><input value={data.first_name||''} onChange={set('first_name')} className="mt-1 h-11 w-full rounded-xl border bg-background px-3"/></label>
      <label>Nom <span className="font-normal text-muted-foreground">(facultatif)</span><input value={data.last_name||''} onChange={set('last_name')} className="mt-1 h-11 w-full rounded-xl border bg-background px-3"/></label>
      <label>Email <span className="font-normal text-muted-foreground">(facultatif)</span><input type="email" value={data.email||''} onChange={set('email')} className="mt-1 h-11 w-full rounded-xl border bg-background px-3"/></label>
      <label>Téléphone <span className="font-normal text-muted-foreground">(facultatif)</span><input type="tel" value={data.phone||''} onChange={set('phone')} className="mt-1 h-11 w-full rounded-xl border bg-background px-3"/></label>
      <label>Date de naissance <span className="font-normal text-muted-foreground">(facultatif)</span><input type="date" value={data.date_of_birth||''} onChange={set('date_of_birth')} className="mt-1 h-11 w-full rounded-xl border bg-background px-3"/></label>
      <label>Années d’expérience <span className="font-normal text-muted-foreground">(facultatif)</span><input min="0" type="number" value={data.experience_years??''} onChange={set('experience_years')} className="mt-1 h-11 w-full rounded-xl border bg-background px-3"/></label>
    </div>
    <fieldset><legend>Métiers recherchés <span className="font-normal text-muted-foreground">(facultatif)</span></legend><div className="mt-2 flex flex-wrap gap-2">{skills.map(skill=><button type="button" key={skill} onClick={()=>toggleSkill(skill)} className={`rounded-full border px-3 py-2 text-sm ${data.skills?.includes(skill)?'bg-primary text-primary-foreground':'bg-card'}`}>{skill}</button>)}</div></fieldset>
  </>;
}