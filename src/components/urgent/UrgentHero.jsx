import { ArrowDown, HeartHandshake, ShieldCheck } from 'lucide-react';
import RequestForm from '@/components/forms/RequestForm';
import UrgentTrustCards from '@/components/urgent/UrgentTrustCards';
import { Image } from '@/components/ui/image';

export default function UrgentHero() {
  return <section className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden bg-primary px-4 py-8 md:px-6 md:py-12">
    <Image src="https://media.base44.com/images/public/6a61e06a56bdababd200203a/c21c2a324_generated_image.png" alt="Table gastronomique prête à accueillir un événement" className="absolute inset-0 -z-30 h-full w-full"/>
    <div className="absolute inset-0 -z-20 bg-primary/80"/>
    <div className="absolute -left-32 top-12 -z-10 h-96 w-96 rounded-full bg-chart-4/20 blur-3xl"/>
    <div className="absolute -right-32 bottom-0 -z-10 h-[32rem] w-[32rem] rounded-full bg-destructive/20 blur-3xl"/>
    <div className="mx-auto grid min-h-[calc(100vh-10rem)] max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)] xl:gap-14">
      <div className="rounded-[2rem] border border-primary-foreground/20 bg-primary/30 p-6 shadow-2xl backdrop-blur-xl md:p-9">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-background/10 px-4 py-2 text-sm font-bold text-primary-foreground"><ShieldCheck size={17} className="text-chart-4"/>Demande traitée en priorité</p>
        <h1 className="mt-6 max-w-2xl font-heading text-4xl font-bold leading-[1.02] tracking-tight text-primary-foreground md:text-6xl">Un imprévu ?<br/>Vous n’êtes pas seul.</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/85 md:text-xl">Décrivez simplement votre besoin. Nous le transmettons aux traiteurs disponibles autour de votre événement pour vous aider à trouver une solution rapidement.</p>
        <div className="mt-7 flex items-center gap-3 text-sm font-medium text-primary-foreground/80"><HeartHandshake className="text-chart-4"/><span>Quelques minutes suffisent pour lancer votre recherche.</span></div>
        <a href="#demande-urgente" className="mt-7 inline-flex items-center gap-2 rounded-full bg-destructive px-6 py-3 font-bold text-destructive-foreground shadow-xl lg:hidden">Commencer ma demande<ArrowDown size={18}/></a>
        <div className="mt-8"><UrgentTrustCards/></div>
      </div>
      <div id="demande-urgente" className="scroll-mt-24 rounded-[2.5rem] border border-primary-foreground/25 bg-background/10 p-3 shadow-2xl backdrop-blur-xl md:p-5">
        <div className="mb-4 px-2 pt-2 md:px-3"><p className="text-xs font-bold uppercase tracking-[0.18em] text-chart-4">Votre demande urgente</p><h2 className="mt-1 font-heading text-2xl font-bold text-primary-foreground">Dites-nous l’essentiel</h2><p className="mt-1 text-sm text-primary-foreground/70">Étape par étape, sans engagement.</p></div>
        <RequestForm urgent/>
      </div>
    </div>
  </section>;
}