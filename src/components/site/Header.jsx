import { Link } from 'react-router-dom';
import { Menu, Search, Siren } from 'lucide-react';

export default function Header() {
  return <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
    <div className="mx-auto flex h-16 max-w-7xl items-center gap-5 px-4">
      <Link to="/" className="font-heading text-xl font-bold text-primary">Un Bon Traiteur</Link>
      <nav className="ml-auto hidden items-center gap-5 text-sm font-medium lg:flex">
        <Link to="/recherche">Trouver un traiteur</Link><Link to="/urgence-traiteur">Demande urgente</Link>
        <Link to="/guides">Conseils</Link><Link to="/tarifs-professionnels">Tarifs professionnels</Link>
        <Link to="/espace-traiteur">Espace traiteur</Link><span>Connexion</span>
      </nav>
      <div className="ml-auto flex gap-2 lg:hidden">
        <Link aria-label="Rechercher" to="/recherche" className="rounded-full p-2 text-primary"><Search /></Link>
        <Link aria-label="Urgence" to="/urgence-traiteur" className="rounded-full p-2 text-destructive"><Siren /></Link>
        <button aria-label="Ouvrir le menu" className="rounded-full p-2"><Menu /></button>
      </div>
    </div>
  </header>;
}