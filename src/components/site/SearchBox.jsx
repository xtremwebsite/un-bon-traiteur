import { useNavigate } from 'react-router-dom';
import { LocateFixed, Search } from 'lucide-react';
import { useState } from 'react';

export default function SearchBox() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ event: '', location: '', date: '', guests: '' });
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const submit = (e) => { e.preventDefault(); navigate(`/recherche?${new URLSearchParams(form)}`); };
  const locate = () => navigator.geolocation?.getCurrentPosition(({ coords }) => setForm({ ...form, location: `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` }));
  return <form onSubmit={submit} className="grid gap-3 rounded-2xl border bg-background/85 p-4 shadow-xl backdrop-blur md:grid-cols-5">
    <label className="text-xs font-semibold">Type d’événement<select required value={form.event} onChange={set('event')} className="mt-1 h-11 w-full rounded-lg border bg-background px-3 text-sm"><option value="">Choisir</option><option>Mariage</option><option>Anniversaire</option><option>Séminaire</option><option>Cocktail</option><option>Autre</option></select></label>
    <label className="text-xs font-semibold">Ville ou code postal<input required value={form.location} onChange={set('location')} className="mt-1 h-11 w-full rounded-lg border bg-background px-3 text-sm" placeholder="Ex. Lyon" /></label>
    <label className="text-xs font-semibold">Date<input required type="date" value={form.date} onChange={set('date')} className="mt-1 h-11 w-full rounded-lg border bg-background px-3 text-sm" /></label>
    <label className="text-xs font-semibold">Invités<input required min="1" type="number" value={form.guests} onChange={set('guests')} className="mt-1 h-11 w-full rounded-lg border bg-background px-3 text-sm" placeholder="80" /></label>
    <button className="mt-auto flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-semibold text-primary-foreground"><Search size={18}/>Trouver</button>
    <button type="button" onClick={locate} className="flex items-center gap-2 text-sm font-medium text-primary md:col-span-5"><LocateFixed size={16}/>Autour de moi</button>
  </form>;
}