import {Clock3} from 'lucide-react';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import LogoutButton from '@/components/auth/LogoutButton';
import DeleteExtraAccountButton from '@/components/extras/DeleteExtraAccountButton';

export default function ExtraPendingApproval(){
  return <><Header/><main className="grid min-h-[70vh] place-items-center bg-primary/5 px-4 py-12"><section className="w-full max-w-xl rounded-3xl border bg-card p-8 text-center shadow-xl"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-primary"><Clock3 size={30}/></span><p className="mt-6 text-sm font-bold uppercase tracking-widest text-destructive">Validation en cours</p><h1 className="mt-2 font-heading text-3xl font-bold">Votre compte Extra est en attente</h1><p className="mt-3 text-muted-foreground">Un administrateur vérifie votre profil. Vous recevrez un e-mail dès que votre compte sera validé ; le planning et les annonces seront alors accessibles.</p><div className="mt-6 flex flex-col items-center gap-3"><LogoutButton/><DeleteExtraAccountButton/></div></section></main><Footer/></>;
}