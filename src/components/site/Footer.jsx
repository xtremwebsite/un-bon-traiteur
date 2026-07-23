import { Link } from 'react-router-dom';

export default function Footer() {
  return <footer className="mt-16 bg-primary text-primary-foreground">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
      <div><p className="font-heading text-xl font-bold">Un Bon Traiteur</p><p className="mt-3 text-sm opacity-80">Le bon traiteur, au bon endroit, au bon moment.</p></div>
      <div><p className="font-semibold">Découvrir</p><Link className="mt-3 block text-sm" to="/recherche">Trouver un traiteur</Link><Link className="mt-2 block text-sm" to="/urgence-traiteur">Demande urgente</Link></div>
      <div><p className="font-semibold">Professionnels</p><Link className="mt-3 block text-sm" to="/tarifs-professionnels">Tarifs</Link><Link className="mt-2 block text-sm" to="/referencement">Fonctionnement du classement</Link></div>
      <div><p className="font-semibold">Informations</p><Link className="mt-3 block text-sm" to="/legal/confidentialite">Confidentialité</Link><Link className="mt-2 block text-sm" to="/legal/mentions-legales">Mentions légales</Link></div>
    </div>
    <p className="border-t border-primary-foreground/20 px-4 py-5 text-center text-xs">© 2026 Un Bon Traiteur · France</p>
  </footer>;
}