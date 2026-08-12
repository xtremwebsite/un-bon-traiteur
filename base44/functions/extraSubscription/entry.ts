import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

const priceId='price_1U3XtyI18y953FJRAffvh2Zo';
async function stripeRequest(path,params,idempotent=false){const headers={Authorization:`Bearer ${secrets.get('STRIPE_SECRET_KEY')}`,'Stripe-Version':'2025-10-29.clover','Content-Type':'application/x-www-form-urlencoded'};if(idempotent)headers['Idempotency-Key']=crypto.randomUUID();const response=await fetch(`https://api.stripe.com/v1/${path}`,{method:'POST',headers,body:new URLSearchParams(params)});const data=await response.json();if(!response.ok)throw new Error(data.error?.message||'Paiement impossible');return data;}
export default async function(req: Request): Promise<Response>{
  try{
    const base44=createClientFromRequest(req);const user=await base44.auth.me();if(!user)return Response.json({error:'Non autorisé'},{status:401});
    const body=await req.json();if(!['checkout','cancel_for_deletion'].includes(body.action))return Response.json({error:'Action inconnue'},{status:400});
    const profiles=await base44.asServiceRole.entities.ExtraProfile.filter({created_by_id:user.id},'-created_date',1);const profile=profiles[0];
    if(!profile)return Response.json({error:'Profil Extra introuvable.'},{status:404});
    if(body.action==='cancel_for_deletion'){
      if(profile.stripe_subscription_id){const response=await fetch(`https://api.stripe.com/v1/subscriptions/${profile.stripe_subscription_id}`,{method:'DELETE',headers:{Authorization:`Bearer ${secrets.get('STRIPE_SECRET_KEY')}`,'Stripe-Version':'2025-10-29.clover'}});const result=await response.json();if(!response.ok)throw new Error(result.error?.message||'Résiliation impossible');}
      return Response.json({cancelled:true});
    }
    if(profile.status!=='approved')return Response.json({error:'Le profil Extra doit être validé.'},{status:403});
    if(profile.subscription_plan==='unlimited'&&profile.subscription_status==='active')return Response.json({error:'Votre abonnement est déjà actif.'},{status:409});
    let customerId=profile.stripe_customer_id;
    if(!customerId){const customer=await stripeRequest('customers',{email:user.email,name:[profile.first_name,profile.last_name].filter(Boolean).join(' '),'metadata[base44_app_id]':secrets.get('BASE44_APP_ID'),'metadata[user_id]':user.id,'metadata[extra_profile_id]':profile.id},true);customerId=customer.id;await base44.asServiceRole.entities.ExtraProfile.update(profile.id,{stripe_customer_id:customerId});}
    const baseUrl='https://bon-traiteur-go.base44.app';
    const session=await stripeRequest('checkout/sessions',{mode:'subscription',customer:customerId,'line_items[0][price]':priceId,'line_items[0][quantity]':'1',success_url:`${baseUrl}/inscription-extra?subscription=success`,cancel_url:`${baseUrl}/inscription-extra?subscription=cancelled`,'metadata[base44_app_id]':secrets.get('BASE44_APP_ID'),'metadata[user_id]':user.id,'metadata[extra_profile_id]':profile.id,'subscription_data[metadata][base44_app_id]':secrets.get('BASE44_APP_ID'),'subscription_data[metadata][user_id]':user.id,'subscription_data[metadata][extra_profile_id]':profile.id},true);
    return Response.json({url:session.url});
  }catch(error){console.error('extraSubscription',error);return Response.json({error:error.message||'Paiement impossible'},{status:500});}
}