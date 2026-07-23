import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, ShieldCheck } from 'lucide-react';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import SearchBox from '@/components/site/SearchBox';
import NearbyCaterers from '@/components/home/NearbyCaterers';
import HomeFAQ from '@/components/home/HomeFAQ';
import MomentGrid from '@/components/home/MomentGrid';
export default function Home() {
  return <><Header/><main>
    <section className="relative overflow-hidden bg-secondary"><div className="mx-auto max-w-7xl px-4 py-16 md:py-24"><div className="max-w-3xl"><p className="mb-3 font-semibold text-destructive">Partout en France</p><h1 className="font-heading text-4xl font-bold tracking-tight md:text-6xl">Trouvez le bon traiteur pour votre événement</h1><p className="mt-5 text-lg text-muted-foreground">Comparez les traiteurs disponibles près de chez vous et recevez des propositions adaptées à votre date, votre budget et votre nombre d’invités.</p></div><div className="mt-8"><SearchBox/></div><Link to="/urgence-traiteur" className="mt-5 flex max-w-xl items-center justify-between rounded-2xl bg-destructive p-5 text-destructive-foreground shadow-lg"><span><strong className="block text-lg">Mon traiteur m’a lâché</strong><small>Publiez une demande urgente en 2 minutes.</small></span><ArrowRight/></Link></div></section>
    <MomentGrid/>
    <NearbyCaterers/>
    <section className="bg-primary py-14 text-primary-foreground"><div className="mx-auto max-w-7xl px-4"><h2 className="font-heading text-3xl font-bold">Simple, clair, sans engagement</h2><div className="mt-8 grid gap-6 md:grid-cols-3">{[[Clock3,'Décrivez votre événement','Les informations essentielles en quelques minutes.'],[ShieldCheck,'Comparez des professionnels','Prix indicatifs, capacités et services visibles.'],[CheckCircle2,'Choisissez librement','Le contrat reste conclu directement avec le traiteur.']].map(([I,t,d])=><div key={t} className="rounded-2xl bg-primary-foreground/10 p-6"><I/><h3 className="mt-4 text-xl font-bold">{t}</h3><p className="mt-2 opacity-80">{d}</p></div>)}</div></div></section>
    <HomeFAQ/>
    <section className="mx-auto max-w-7xl px-4 py-14"><div className="rounded-3xl border bg-card p-8 md:flex md:items-center md:justify-between"><div><h2 className="font-heading text-3xl font-bold">Vous êtes traiteur ?</h2><p className="mt-2 text-muted-foreground">Présentez votre savoir-faire et recevez des demandes compatibles.</p></div><Link to="/espace-traiteur" className="mt-5 inline-flex rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground md:mt-0">Découvrir l’espace professionnel</Link></div></section>
  </main><Link to="/urgence-traiteur" className="fixed bottom-4 right-4 z-30 rounded-full bg-destructive px-4 py-3 text-sm font-bold text-destructive-foreground shadow-xl md:hidden">Urgence traiteur</Link><Footer/></>;
}