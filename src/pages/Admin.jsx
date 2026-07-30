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
import CatalogManager from '@/components/admin/CatalogManager';
import N8nWebhookPanel from '@/components/admin/N8nWebhookPanel';
import ExtraValidationTable from '@/components/admin/ExtraValidationTable';

export default function Admin() {
  const [active, setActive] = useState('overview');
  const [data, setData] = useState({ caterers: [], extras: [], quotes: [], urgent: [], users: [], plans: [], reviews: [], webhooks: [], me: null });
  const [loading, setLoading] = useState(true);
  const load = async () => { const [caterers, extras, quotes, urgent, users, plans, reviews, webhooks, me] = await Promise.all([base44.entities.CatererProfile.list('-created_date', 200), base44.entities.ExtraProfile.list('-created_date', 200), base44.entities.QuoteRequest.list('-created_date', 200), base44.entities.UrgentRequest.list('-created_date', 200), base44.entities.User.list('-created_date', 200), base44.entities.SubscriptionPlan.list('display_order', 50), base44.entities.Review.list('-created_date', 200), base44.entities.WebhookDelivery.list('-created_date', 200), base44.auth.me()]); setData({ caterers, extras, quotes, urgent, users, plans, reviews, webhooks, me }); setLoading(false); };
  useEffect(() => { load(); }, []);
  const update = async (entity, id, payload) => { await base44.entities[entity].update(id, payload); await load(); };
  const removeUser = async id => { if (!window.confirm('Supprimer définitivement ce compte ?')) return; await base44.entities.User.delete(id); await load(); };
  const removeProfileAccount = async (entity, profile) => { if (!window.confirm('Supprimer définitivement ce profil et son compte ?')) return; await base44.entities[entity].delete(profile.id); if (profile.created_by_id && (entity === 'ExtraProfile' || profile.profile_origin === 'owner')) await base44.entities.User.delete(profile.created_by_id); await load(); };
  const ownedProfiles = [...data.caterers.filter(x => x.profile_origin === 'owner').map(x => ({type:'professional',id:x.created_by_id,date:x.created_date})), ...data.extras.map(x => ({type:'extra',id:x.created_by_id,date:x.created_date}))].sort((a,b) => new Date(a.date)-new Date(b.date));
  const accountTypes = new Map(); ownedProfiles.forEach(item => { if (!accountTypes.has(item.id)) accountTypes.set(item.id,item.type); });
  const classifiedCaterers = data.caterers.filter(x => x.profile_origin !== 'owner' || accountTypes.get(x.created_by_id) === 'professional');
  const classifiedExtras = data.extras.filter(x => accountTypes.get(x.created_by_id) === 'extra');
  const particularUsers = data.users.filter(user => user.role !== 'admin' && !accountTypes.has(user.id));
  const stats = { caterers: data.caterers.length, published: data.caterers.filter(x => x.published).length, users: data.users.filter(x => x.role !== 'admin').length, quotes: data.quotes.length + data.urgent.length, pending: data.quotes.filter(x => ['submitted','matched'].includes(x.status)).length + data.urgent.filter(x => x.status === 'to_verify').length, reviews: data.reviews.filter(x => x.status === 'pending').length };
  return <AdminGuard><div className="min-h-screen bg-primary/5"><AdminHeader/><main className="mx-auto max-w-7xl px-4 py-8"><div className="rounded-[2rem] border bg-card/90 p-6 shadow-xl backdrop-blur-xl"><p className="text-sm font-bold text-destructive">Pilotage de la plateforme</p><h1 className="mt-1 font-heading text-4xl font-bold">Back-office administrateur</h1><p className="mt-2 text-muted-foreground">Supervisez l’activité depuis un espace unique et structuré.</p></div><div className="mt-6 grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]"><AdminTabs active={active} onChange={setActive}/><section className="min-w-0">{loading ? <div className="h-52 animate-pulse rounded-3xl bg-muted"/> : <>{active === 'overview' && <AdminStats stats={stats}/>} {active === 'professionals' && <CatererTable items={classifiedCaterers} users={data.users} onUpdate={(id,payload) => update('CatererProfile',id,payload)} onUpdateUser={(id,payload) => update('User',id,payload)} onDelete={profile => removeProfileAccount('CatererProfile',profile)}/>} {active === 'extras' && <ExtraValidationTable items={classifiedExtras} onUpdate={(id,payload) => update('ExtraProfile',id,payload)} onDelete={profile => removeProfileAccount('ExtraProfile',profile)}/>} {active === 'users' && <UserTable items={particularUsers} currentUserId={data.me?.id} onUpdate={(id,payload) => update('User',id,payload)} onDelete={removeUser}/>} {active === 'subscriptions' && <PlanTable items={data.plans} onUpdate={(id,payload) => update('SubscriptionPlan',id,payload)}/>} {active === 'catalogs' && <CatalogManager/>} {active === 'webhooks' && <N8nWebhookPanel items={data.webhooks}/>} {active === 'requests' && <div className="space-y-6"><QuoteTable items={data.quotes} onUpdate={(id,payload) => update('QuoteRequest',id,payload)}/><UrgentTable items={data.urgent} onUpdate={(id,payload) => update('UrgentRequest',id,payload)}/></div>} {active === 'reviews' && <ReviewTable items={data.reviews} caterers={data.caterers} onUpdate={(id,payload) => update('Review',id,payload)}/>}</>}</section></div></main></div></AdminGuard>;
}