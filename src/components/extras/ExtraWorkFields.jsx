const languages=['Français','Anglais','Arabe','Italien','Espagnol','Chinois','Allemand','Autres'];
const transports=[['none','Sans moyen de transport'],['public','Transports en commun'],['vehicle','Véhicule personnel']];
const heights=Array.from({length:71},(_,index)=>150+index);

export default function ExtraWorkFields({data,set,toggleArray}) {
  return <section id="experience" className="scroll-mt-24 space-y-4 rounded-2xl border p-4">
    <h2 className="text-lg font-bold">Expérience et conditions souhaitées</h2>
    <label className="block">Expérience <span className="font-normal text-muted-foreground">(facultatif)</span><textarea value={data.experience_details||''} onChange={set('experience_details')} className="mt-1 min-h-24 w-full rounded-xl border bg-background p-3" placeholder="Missions, établissements, spécialités…"/></label>
    <div className="grid gap-4 sm:grid-cols-2">
      <label>Taille de tenue<select value={data.clothing_size||''} onChange={set('clothing_size')} className="mt-1 h-11 w-full rounded-xl border bg-background px-3"><option value="">Non renseignée</option>{['xs','s','m','l','xl','xxl'].map(size=><option key={size} value={size}>{size.toUpperCase()}</option>)}</select></label>
      <label>Taille en cm<select value={data.height_cm||''} onChange={set('height_cm')} className="mt-1 h-11 w-full rounded-xl border bg-background px-3"><option value="">Non renseignée</option>{heights.map(height=><option key={height} value={height}>{(height/100).toLocaleString('fr-FR',{minimumFractionDigits:2})} m</option>)}</select></label>
      <label>Rayon de mobilité (km)<select value={data.mobility_radius_km??''} onChange={set('mobility_radius_km')} className="mt-1 h-11 w-full rounded-xl border bg-background px-3"><option value="">Non renseigné</option>{[10,25,50,75,100].map(radius=><option key={radius} value={radius}>{radius} km autour de ma ville</option>)}</select></label>
      <label>Tarif horaire souhaité (€)<input min="0" step="0.5" type="number" value={data.hourly_rate??''} onChange={set('hourly_rate')} className="mt-1 h-11 w-full rounded-xl border bg-background px-3"/></label>
    </div>
    <fieldset><legend>Langues parlées</legend><div className="mt-2 flex flex-wrap gap-2">{languages.map(language=><button type="button" key={language} aria-pressed={(data.languages||[]).includes(language)} onClick={()=>toggleArray('languages',language)} className={`rounded-full border px-3 py-2 text-sm ${(data.languages||[]).includes(language)?'bg-primary text-primary-foreground':'bg-card'}`}>{language}</button>)}</div></fieldset>
    <fieldset><legend>Transports disponibles</legend><div className="mt-2 flex flex-wrap gap-2">{transports.map(([value,label])=><button type="button" key={value} aria-pressed={(data.transport||[]).includes(value)} onClick={()=>toggleArray('transport',value)} className={`rounded-full border px-3 py-2 text-sm ${(data.transport||[]).includes(value)?'bg-primary text-primary-foreground':'bg-card'}`}>{label}</button>)}</div></fieldset>
    <div className="grid gap-4 sm:grid-cols-2"><label>Certifications <span className="font-normal text-muted-foreground">(facultatif)</span><input value={(data.certifications||[]).join(', ')} onChange={set('certifications',true)} className="mt-1 h-11 w-full rounded-xl border bg-background px-3" placeholder="HACCP, permis…"/></label><label>Disponibilités<input value={data.availability_notes||''} onChange={set('availability_notes')} className="mt-1 h-11 w-full rounded-xl border bg-background px-3" placeholder="Soirs, week-ends, ponctuel…"/></label></div>
  </section>;
}