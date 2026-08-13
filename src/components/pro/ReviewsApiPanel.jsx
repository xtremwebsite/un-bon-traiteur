import { Braces } from 'lucide-react';
import ProReviews from '@/components/pro/ProReviews';

export default function ReviewsApiPanel() {
  return <div className="space-y-6"><ProReviews/><section className="rounded-3xl border bg-card/90 p-6 shadow-xl backdrop-blur-xl"><div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground"><Braces size={20}/></span><div><h2 className="font-heading text-xl font-bold">Accès API</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Vous avez besoin de récupérer les informations de votre fiche ou vos avis dans un outil externe ? Un accès API sécurisé peut vous être fourni sur demande.</p></div></div></section></div>;
}