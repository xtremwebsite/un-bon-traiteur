import {MessageCircle,Phone} from 'lucide-react';

const whatsappNumber=value=>{const digits=String(value||'').replace(/\D/g,'');return digits.startsWith('0')?`33${digits.slice(1)}`:digits};

export default function CatererProfileNav({item}){
  const number=whatsappNumber(item.whatsapp_phone);
  const links=[['presentation','Présentation'],['galerie','Galerie'],['tarifs','Tarifs'],['options','Options'],['faq','FAQ'],['avis','Avis']];
  return <div className="sticky top-16 z-[900] px-3 py-3">
    <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-hidden rounded-[1.75rem] border bg-card/75 p-2 shadow-2xl backdrop-blur-2xl">
      <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto whitespace-nowrap text-sm font-semibold">{links.map(([id,label])=><a key={id} href={`#${id}`} className="rounded-full border border-transparent px-4 py-2 transition duration-200 hover:-translate-y-0.5 hover:border-primary/15 hover:bg-secondary hover:text-primary hover:shadow-lg">{label}</a>)}</nav>
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={()=>window.dispatchEvent(new CustomEvent('quote:open'))} className="rounded-full bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl">Obtenir un devis</button>
        {item.phone&&<a href={`tel:${item.phone}`} aria-label={`Appeler ${item.business_name}`} className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl"><Phone size={17}/></a>}
        {number&&<a href={`https://wa.me/${number}?text=${encodeURIComponent(`Bonjour ${item.business_name}, je vous contacte depuis Un Bon Traiteur.`)}`} target="_blank" rel="noreferrer" aria-label={`Contacter ${item.business_name} sur WhatsApp`} className="grid h-10 w-10 place-items-center rounded-full bg-chart-2 text-primary-foreground shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl"><MessageCircle size={17}/></a>}
      </div>
    </div>
  </div>;
}