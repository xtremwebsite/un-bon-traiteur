import {useState} from 'react';
import {base44} from '@/api/base44Client';
import ExtraIdentityFields from '@/components/extras/ExtraIdentityFields';
import ExtraWorkFields from '@/components/extras/ExtraWorkFields';
import ExtraPrivacyFields from '@/components/extras/ExtraPrivacyFields';
import ExtraAvailabilityCalendar from '@/components/extras/ExtraAvailabilityCalendar';
import {sanitizeAvailabilityDates} from '@/lib/extraAvailability';

const defaults={first_name:'',last_name:'',email:'',phone:'',date_of_birth:'',address:'',postal_code:'',city:'',skills:[],experience_years:'',experience_details:'',languages:[],certifications:[],availability_notes:'',availability_dates:[],mobility_radius_km:'',transport:'',hourly_rate:'',photo_urls:[],available:true,display_last_name:false,display_email:false,display_phone:false,contact_preference:'site'};
export default function ExtraProfileForm({initial,user,onSaved}) {
  const [data,setData]=useState({...defaults,email:user?.email||'',...initial}); const [busy,setBusy]=useState(false); const [files,setFiles]=useState([]); const [error,setError]=useState('');
  const set=(key,list=false)=>e=>setData(x=>({...x,[key]:list?e.target.value.split(',').map(v=>v.trim()).filter(Boolean):e.target.type==='checkbox'?e.target.checked:e.target.value}));
  const toggleSkill=skill=>setData(x=>({...x,skills:(x.skills||[]).includes(skill)?x.skills.filter(item=>item!==skill):[...(x.skills||[]),skill]}));
  const submit=async e=>{e.preventDefault();setBusy(true);setError('');try{const uploads=await Promise.all([...files].map(file=>base44.integrations.Core.UploadFile({file})));const number=value=>value===''?undefined:Number(value);const payload={...data,experience_years:number(data.experience_years),mobility_radius_km:number(data.mobility_radius_km),hourly_rate:number(data.hourly_rate),availability_dates:sanitizeAvailabilityDates(data.availability_dates),photo_urls:[...(data.photo_urls||[]),...uploads.map(item=>item.file_url)],status:'pending',admin_comment:'',active:true};const response=await base44.functions.invoke('extrasHub',{action:'save_profile',data:payload});onSaved(response.data.item)}catch(err){setError(err.message||'Enregistrement impossible.')}finally{setBusy(false)}};
  return <form onSubmit={submit} className="space-y-5 text-sm font-semibold">
    <ExtraIdentityFields data={data} set={set} toggleSkill={toggleSkill}/>
    <section id="coordonnees" className="scroll-mt-24"><h2 className="mb-3 text-lg font-bold">Coordonnées privées</h2><div className="grid gap-4 sm:grid-cols-[1fr_130px]"><label>Adresse *<input required autoComplete="street-address" value={data.address||''} onChange={set('address')} className="mt-1 h-11 w-full rounded-xl border bg-background px-3"/></label><label>Code postal *<input required autoComplete="postal-code" value={data.postal_code||''} onChange={set('postal_code')} className="mt-1 h-11 w-full rounded-xl border bg-background px-3"/></label><label className="sm:col-span-2">Ville *<input required autoComplete="address-level2" value={data.city||''} onChange={set('city')} className="mt-1 h-11 w-full rounded-xl border bg-background px-3"/></label></div></section>
    <ExtraWorkFields data={data} set={set}/><ExtraAvailabilityCalendar value={data.availability_dates} onChange={availability_dates=>setData(x=>({...x,availability_dates}))}/><ExtraPrivacyFields data={data} set={set}/>
    <label className="block">Photos <span className="font-normal text-muted-foreground">(facultatives)</span><input type="file" multiple accept="image/*" onChange={e=>setFiles(e.target.files)} className="mt-1 block w-full rounded-xl border bg-background p-3"/></label>
    <label className="flex gap-3 rounded-xl bg-secondary p-3"><input type="checkbox" checked={Boolean(data.available)} onChange={set('available')}/>Je suis actuellement disponible</label>
    {error&&<p className="rounded-xl bg-destructive/10 p-3 text-destructive">{error}</p>}<button disabled={busy} className="w-full rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-50">{busy?'Envoi en validation…':'Soumettre mon profil à validation'}</button>
  </form>;
}