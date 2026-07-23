import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import ReviewsSection from '@/components/reviews/ReviewsSection';
import CatererHero from '@/components/caterer/CatererHero';
import CatererGallery from '@/components/caterer/CatererGallery';

export default function CatererProfile() {
  const { slug }=useParams(); const [item,setItem]=useState(); const [loading,setLoading]=useState(true);
  useEffect(()=>{base44.entities.CatererProfile.filter({slug,published:true}).then(x=>setItem(x[0])).finally(()=>setLoading(false));},[slug]);
  if(loading) return <div className="min-h-screen animate-pulse bg-muted"/>;
  if(!item) return <><Header/><main className="mx-auto max-w-4xl px-4 py-20"><h1 className="text-3xl font-bold">Traiteur introuvable</h1></main></>;
  return <><Header/><main><CatererHero item={item}/><CatererGallery images={item.gallery||[]} businessName={item.business_name}/><div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_320px]"><article><h2 className="text-2xl font-bold">Présentation</h2><p className="mt-4 leading-7 text-muted-foreground">{item.description}</p><h2 className="mt-10 text-2xl font-bold">Spécialités et services</h2><div className="mt-4 flex flex-wrap gap-2">{[...(item.cuisines||[]),...(item.formats||[]),...(item.services||[])].map(x=><span key={x} className="rounded-full bg-secondary px-3 py-2 text-sm">{x}</span>)}</div><h2 className="mt-10 text-2xl font-bold">Zone d’intervention</h2><div className="mt-4 flex h-52 items-center justify-center rounded-2xl bg-muted text-muted-foreground">Carte chargée uniquement à la demande</div><ReviewsSection caterer={item}/></article><aside className="h-fit rounded-2xl border bg-card p-6 shadow-sm"><p className="text-sm text-muted-foreground">Prix indicatif</p><p className="mt-1 text-2xl font-bold">Dès {item.price_from_per_person} € / personne</p><p className="mt-5 text-sm">Capacité : {item.min_guests} à {item.max_guests} invités</p><p className="mt-2 text-sm">Réponse moyenne : {item.average_response_hours} h</p><Link to={`/demande-devis?caterer=${item.id}`} className="mt-6 block rounded-lg bg-primary p-3 text-center font-bold text-primary-foreground">Demander un devis</Link></aside></div></main><div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background p-3 md:hidden"><Link to={`/demande-devis?caterer=${item.id}`} className="block rounded-lg bg-destructive p-3 text-center font-bold text-destructive-foreground">Demander un devis</Link></div><Footer/></>;
}