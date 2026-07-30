import {useEffect,useState} from 'react';
import {base44} from '@/api/base44Client';
import CatalogList from '@/components/admin/CatalogList';

const slugify=value=>value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export default function CatalogManager(){
  const[events,setEvents]=useState([]);const[formats,setFormats]=useState([]);const[jobs,setJobs]=useState([]);
  const[eventName,setEventName]=useState('');const[formatName,setFormatName]=useState('');const[jobName,setJobName]=useState('');
  const load=async()=>{const[eventItems,formatItems,jobItems]=await Promise.all([base44.entities.EventType.list('display_order',100),base44.entities.Format.list('display_order',100),base44.entities.ExtraJobType.list('display_order',100)]);setEvents(eventItems);setFormats(formatItems);setJobs(jobItems)};
  useEffect(()=>{load()},[]);
  const config=entity=>entity==='EventType'?[events,eventName,setEventName]:entity==='Format'?[formats,formatName,setFormatName]:[jobs,jobName,setJobName];
  const add=entity=>async e=>{e.preventDefault();const[items,name,setName]=config(entity);await base44.entities[entity].create({name:name.trim(),slug:slugify(name),active:true,display_order:items.length+1});setName('');await load()};
  const toggle=entity=>async item=>{await base44.entities[entity].update(item.id,{active:!item.active});await load()};
  const remove=entity=>async id=>{await base44.entities[entity].delete(id);await load()};
  return <div><div className="mb-5"><h2 className="font-heading text-2xl font-bold">Catalogues</h2><p className="mt-1 text-sm text-muted-foreground">Gérez les listes utilisées dans les fiches et les recherches.</p></div><div className="grid gap-5 xl:grid-cols-3"><CatalogList title="Types d’événement" description="Mariage, anniversaire, séminaire…" items={events} value={eventName} onValue={setEventName} onAdd={add('EventType')} onToggle={toggle('EventType')} onDelete={remove('EventType')}/><CatalogList title="Formats de prestation" description="Buffet, cocktail, repas assis…" items={formats} value={formatName} onValue={setFormatName} onAdd={add('Format')} onToggle={toggle('Format')} onDelete={remove('Format')}/><CatalogList title="Métiers Extras" description="Serveur, chef, barman…" items={jobs} value={jobName} onValue={setJobName} onAdd={add('ExtraJobType')} onToggle={toggle('ExtraJobType')} onDelete={remove('ExtraJobType')}/></div></div>;
}