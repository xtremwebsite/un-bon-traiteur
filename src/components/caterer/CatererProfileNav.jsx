import {ChevronRight,MessageCircle,Phone} from 'lucide-react';
import {Link} from 'react-router-dom';

const whatsappNumber=value=>{const digits=String(value||'').replace(/\D/g,'');return digits.startsWith('0')?`33${digits.slice(1)}`:digits};

export default function CatererProfileNav({item}){
  const number=whatsappNumber(item.whatsapp_phone);
  const links=[['presentation','Présentation'],['galerie','Galerie'],['tarifs','Tarifs'],['options','Options'],['faq','FAQ'],['avis','Avis']];
  return <div className="sticky top-16 z-[900] border-b bg-background/95 shadow-sm backdrop-blur-xl">
    <div className="mx-auto max-w-7xl px-4">
      <div className="flex h-9 items-center gap-1 overflow-hidden border-b text-xs text-muted-foreground">
        <Link to="/" className="shrink-0 hover:text-primary">Accueil</Link><ChevronRight size={13}/><Link to="/recherche" className="shrink-0 hover:text-primary">Traiteurs</Link><ChevronRight size={13}/><span className="truncate font-semibold text-foreground">{item.business_name}</span>
      </div>
      <div className="flex h-14 items-center gap-3">
        <nav className="flex min-w-0 flex-1 gap-5 overflow-x-auto whitespace-nowrap text-sm font-semibold">{links.map(([id,label])=><a key={id} href={`#${id}`} className="hover:text-primary">{label}</a>)}</nav>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={()=>window.dispatchEvent(new CustomEvent('quote:open'))} className="rounded-full bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground">Obtenir un devis</button>
          {item.phone&&<a href={`tel:${item.phone}`} aria-label={`Appeler ${item.business_name}`} className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground"><Phone size={17}/></a>}
          {number&&<a href={`https://wa.me/${number}?text=${encodeURIComponent(`Bonjour ${item.business_name}, je vous contacte depuis Un Bon Traiteur.`)}`} target="_blank" rel="noreferrer" aria-label={`Contacter ${item.business_name} sur WhatsApp`} className="grid h-9 w-9 place-items-center rounded-full bg-chart-2 text-primary-foreground"><MessageCircle size={17}/></a>}
        </div>
      </div>
    </div>
  </div>;
}