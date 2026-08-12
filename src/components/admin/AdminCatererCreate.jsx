import { useState } from 'react';
import { Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CatererProfileForm from '@/components/pro/CatererProfileForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const slugify = value => String(value || 'traiteur').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function AdminCatererCreate({ onCreated }) {
  const [open, setOpen] = useState(false);
  const save = async data => {
    if (!data.business_name?.trim() || !data.city?.trim()) throw new Error('Le nom de l’établissement et la ville sont obligatoires.');
    await base44.entities.CatererProfile.create({
      ...data,
      slug: `${slugify(data.business_name)}-${Date.now().toString().slice(-7)}`,
      status: 'approved',
      published: true,
      verified: false,
      demo: false,
      profile_origin: 'public_source',
      claim_status: 'unclaimed'
    });
    setOpen(false);
    await onCreated?.();
  };
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><button type="button" className="mb-5 flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground"><Plus size={18}/>Créer un traiteur</button></DialogTrigger><DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto"><DialogHeader><DialogTitle>Créer une fiche traiteur</DialogTitle></DialogHeader><CatererProfileForm onSave={save} submitLabel="Créer et publier la fiche"/></DialogContent></Dialog>;
}