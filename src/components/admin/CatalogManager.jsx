import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import CatalogList from '@/components/admin/CatalogList';

const slugify = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function CatalogManager() {
  const [events, setEvents] = useState([]); const [formats, setFormats] = useState([]);
  const [eventName, setEventName] = useState(''); const [formatName, setFormatName] = useState('');
  const load = async () => { const [eventItems, formatItems] = await Promise.all([base44.entities.EventType.list('display_order', 100), base44.entities.Format.list('display_order', 100)]); setEvents(eventItems); setFormats(formatItems); };
  useEffect(() => { load(); }, []);
  const add = entity => async e => { e.preventDefault(); const name = entity === 'EventType' ? eventName : formatName; await base44.entities[entity].create({ name: name.trim(), slug: slugify(name), active: true, display_order: (entity === 'EventType' ? events : formats).length + 1 }); entity === 'EventType' ? setEventName('') : setFormatName(''); await load(); };
  const toggle = entity => async item => { await base44.entities[entity].update(item.id, { active: !item.active }); await load(); };
  const remove = entity => async id => { await base44.entities[entity].delete(id); await load(); };
  return <div><div className="mb-5"><h2 className="font-heading text-2xl font-bold">Types d’événement et formats</h2><p className="mt-1 text-sm text-muted-foreground">Ces listes alimentent les fiches professionnelles, la recherche et les demandes de devis.</p></div><div className="grid gap-6 xl:grid-cols-2"><CatalogList title="Types d’événement" description="Mariage, anniversaire, séminaire…" items={events} value={eventName} onValue={setEventName} onAdd={add('EventType')} onToggle={toggle('EventType')} onDelete={remove('EventType')}/><CatalogList title="Formats de prestation" description="Buffet, cocktail, repas assis…" items={formats} value={formatName} onValue={setFormatName} onAdd={add('Format')} onToggle={toggle('Format')} onDelete={remove('Format')}/></div></div>;
}