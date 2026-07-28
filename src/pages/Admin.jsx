import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminStats from '@/components/admin/AdminStats';
import AdminTabs from '@/components/admin/AdminTabs';
import CatererTable from '@/components/admin/CatererTable';
import QuoteTable from '@/components/admin/QuoteTable';
import UrgentTable from '@/components/admin/UrgentTable';
import UserTable from '@/components/admin/UserTable';
import PlanTable from '@/components/admin/PlanTable';
import ReviewTable from '@/components/admin/ReviewTable';

export default function Admin() {
  const [active, setActive] = useState('overview');
  const [data, setData] = useState({ caterers: [], quotes: [], urgent: [], users: [], plans: [], reviews: [], me: null });
  const [loading, setLoading] = useState(true);
  const load = async () => { const [caterers, quotes, urgent, users, plans, reviews, me] = await Promise.all([base44.entities.CatererProfile.list('-created_date', 200), base44.entities.QuoteRequest.list('-created_date', 200), base44.entities.UrgentRequest.list('-created_date', 200), base44.entities.User.list('-created_date', 200), base44.entities.SubscriptionPlan.list('display_order', 50), base44.entities.Review.list('-created_date', 200), base44.auth.me()]); setData({ caterers, quotes, urgent, users, plans, reviews, me }); setLoading(false); };
  useEffect(() => { load(); }, []);
  const update = async (entity, id, payload) => { await base44.entities[entity].update(id, payload); await load(); };
  const stats = { caterers: data.caterers.length, published: data.caterers.filter(x => x.published).length, users: data.users.filter(x => x.role !== 'admin').length, quotes: data.quotes.length + data.urgent.length, pending: data.quotes.filter(x => ['submitted','matched'].includes(x.status)).length + data.urgent.filter(x => x.status === 'to_verify').length, reviews: data.reviews.filter(x => x.status === 'pending').length };
  return <AdminGuard><div className="min-h-screen bg-primary/5"><AdminHeader/><main className="mx-auto max-w-7xl px-4 py-8"><div className="rounded-[2rem] border bg-card/90 p-6 shadow-xl backdrop-blur-xl"><p className="text-sm font-bold text-destructive">Pilotage de la plateforme</p><h1 className="mt-1 font-heading text-4xl font-bold">Back-office administrateur</h1><p className="mt-2 text-muted-foreground">Supervisez l’activité depuis un espace unique et structuré.</p></div><div className="mt-6 grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]"><AdminTabs active={active} onChange={setActive}/><section className="min-w-0">{loading ? <div className="h-52 animate-pulse rounded-3xl bg-muted"/> : <>{active === 'overview' && <AdminStats stats={stats}/>} {active === 'professionals' && <CatererTable items={data.caterers} onUpdate={(id,payload) => update('CatererProfile',id,payload)}/>} {active === 'users' && <UserTable items={data.users} currentUserId={data.me?.id} onUpdate={(id,payload) => update('User',id,payload)}/>} {active === 'subscriptions' && <PlanTable items={data.plans} onUpdate={(id,payload) => update('SubscriptionPlan',id,payload)}/>} {active === 'requests' && <div className="space-y-6"><QuoteTable items={data.quotes} onUpdate={(id,payload) => update('QuoteRequest',id,payload)}/><UrgentTable items={data.urgent} onUpdate={(id,payload) => update('UrgentRequest',id,payload)}/></div>} {active === 'reviews' && <ReviewTable items={data.reviews} caterers={data.caterers} onUpdate={(id,payload) => update('Review',id,payload)}/>}</>}</section></div></main></div></AdminGuard>;
}