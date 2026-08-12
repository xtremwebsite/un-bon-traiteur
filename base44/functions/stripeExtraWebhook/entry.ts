import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import Stripe from 'npm:stripe@17.5.0';
import { secrets } from 'base44:runtime';

export default async function(req: Request): Promise<Response>{
  try{
    const base44=createClientFromRequest(req);const signature=req.headers.get('stripe-signature');if(!signature)return Response.json({error:'Signature manquante'},{status:400});
    const stripe=new Stripe(secrets.get('STRIPE_SECRET_KEY'),{apiVersion:'2025-10-29.clover'});const raw=await req.text();
    const event=await stripe.webhooks.constructEventAsync(raw,signature,secrets.get('STRIPE_WEBHOOK_SECRET'));
    let subscription=null;let profileId='';
    if(event.type==='checkout.session.completed'){const session=event.data.object;profileId=session.metadata?.extra_profile_id||'';if(session.subscription)subscription=await stripe.subscriptions.retrieve(String(session.subscription));}
    if(['customer.subscription.updated','customer.subscription.deleted'].includes(event.type)){subscription=event.data.object;profileId=subscription.metadata?.extra_profile_id||'';}
    if(subscription&&profileId){const active=['active','trialing'].includes(subscription.status);await base44.asServiceRole.entities.ExtraProfile.update(profileId,{subscription_plan:active?'unlimited':'free',subscription_status:active?'active':subscription.status==='past_due'?'past_due':'cancelled',stripe_subscription_id:subscription.id,stripe_customer_id:String(subscription.customer)});}
    return Response.json({received:true});
  }catch(error){console.error('stripeExtraWebhook',error);return Response.json({error:error.message||'Webhook invalide'},{status:400});}
}