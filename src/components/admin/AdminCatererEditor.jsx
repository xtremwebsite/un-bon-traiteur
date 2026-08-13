import { useState } from 'react';
import { Pencil } from 'lucide-react';
import CatererProfileForm from '@/components/pro/CatererProfileForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AdminCatererEditor({ item, onSave }) {
  const [open, setOpen] = useState(false);
  const save = async data => { await onSave(item.id, data); setOpen(false); };
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><button className="rounded-lg border bg-card p-2 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0" aria-label={`Modifier ${item.business_name}`}><Pencil size={17}/></button></DialogTrigger><DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto"><DialogHeader><DialogTitle>Modifier {item.business_name}</DialogTitle></DialogHeader><CatererProfileForm key={item.updated_date} initial={item} onSave={save} submitLabel="Enregistrer la fiche"/></DialogContent></Dialog>;
}