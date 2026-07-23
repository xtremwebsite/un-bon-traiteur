import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPinned, Menu, Search, Siren, X } from 'lucide-react';

export default function Header() {
  const [open,setOpen]=useState(false);
  return <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
    <div className="mx-auto flex h-16 max-w-7xl items-center gap-5 px-4">
      <Link to="/" className="font-heading text-xl font-bold text-primary">Un Bon Traiteur</Link>
      <nav className="ml-auto hidden items-center gap-5 text-sm font-medium lg:flex">
        <Link to="/recherche">Trouver un traiteur</Link><Link to="/carte">Carte</Link><Link to="/urgence-traiteur">Demande urgente</Link>
        <Link to="/guides">Conseils</Link><Link to="/espace-traiteur">Espace traiteur</Link><span>Connexion</span>
      </nav>
      <div className="ml-auto flex gap-2 lg:hidden">
        <Link aria-label="Rechercher" to="/recherche" className="rounded-full p-2 text-primary"><Search /></Link>
        <Link aria-label="Carte" to="/carte" className="rounded-full p-2 text-primary"><MapPinned /></Link>
        <Link aria-label="Urgence" to="/urgence-traiteur" className="rounded-full p-2 text-destructive"><Siren /></Link>
        <button onClick={()=>setOpen(x=>!x)} aria-label="Ouvrir le menu" className="rounded-full p-2">{open?<X/>:<Menu/>}</button>
      </div>
    </div>
    {open&&<nav className="border-t bg-background px-4 py-4 text-sm font-medium lg:hidden"><div className="mx-auto grid max-w-7xl gap-4"><Link onClick={()=>setOpen(false)} to="/recherche">Trouver un traiteur</Link><Link onClick={()=>setOpen(false)} to="/carte">Carte de France</Link><Link onClick={()=>setOpen(false)} to="/urgence-traiteur">Demande urgente</Link><Link onClick={()=>setOpen(false)} to="/guides">Conseils</Link><Link onClick={()=>setOpen(false)} to="/espace-traiteur">Espace traiteur</Link></div></nav>}
  </header>;
}