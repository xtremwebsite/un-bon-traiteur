import {useState} from 'react';
import {base44} from '@/api/base44Client';
import ExtraAvailabilityCalendar from '@/components/extras/ExtraAvailabilityCalendar';
import {normalizeAvailabilitySlots,sanitizeAvailabilitySlots} from '@/lib/extraAvailability';

export default function ExtraAvailabilityManager({profile,bookings=[],onSaved}){
  const[slots,setSlots]=useState(()=>normalizeAvailabilitySlots(profile?.availability_slots,profile?.availability_dates,profile?.availability_period));
  const[mode,setMode]=useState('day');const[busy,setBusy]=useState(false);const[error,setError]=useState('');
  const save=async()=>{setBusy(true);setError('');try{const availability_slots=sanitizeAvailabilitySlots(slots);const response=await base44.functions.invoke('extrasHub',{action:'save_profile',data:{...profile,availability_slots,availability_dates:availability_slots.map(slot=>slot.date)}});onSaved(response.data.item)}catch(err){setError(err.response?.data?.error||err.message)}finally{setBusy(false)}};
  return <div><ExtraAvailabilityCalendar value={slots} bookings={bookings} mode={mode} onModeChange={setMode} onChange={setSlots}/>{error&&<p className="mt-3 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<button type="button" onClick={save} disabled={busy} className="mt-3 w-full rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground shadow-lg disabled:opacity-50">{busy?'Enregistrement…':'Enregistrer mes disponibilités'}</button></div>;
}