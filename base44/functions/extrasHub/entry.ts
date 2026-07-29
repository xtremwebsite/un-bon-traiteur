import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

function ageFrom(date) { if (!date) return null; const birth=new Date(`${date}T00:00:00`); const today=new Date(); let age=today.getFullYear()-birth.getFullYear(); if(today.getMonth()<birth.getMonth()||(today.getMonth()===birth.getMonth()&&today.getDate()<birth.getDate()))age--; return age; }
function cleanText(value) { return String(value||'').replace(/[<>&]/g,'').trim(); }

export default async function(req: Request): Promise<Response> {
  try {
    const base44=createClientFromRequest(req); const user=await base44.auth.me();
    if(!user)return Response.json({error:'Non autorisé'},{status:401});
    const profiles=await base44.entities.CatererProfile.filter({created_by_id:user.id},'-created_date',1); const caterer=profiles[0];
    if(user.role!=='admin'&&!caterer)return Response.json({error:'Accès réservé aux traiteurs'},{status:403});
    const body=await req.json();
    if(body.action==='directory'){
      const [extras,ratings,requests]=await Promise.all([base44.asServiceRole.entities.ExtraProfile.filter({active:true},'-updated_date',500),base44.asServiceRole.entities.ExtraRecommendation.list('-created_date',1000),base44.entities.ExtraRequest.list('-created_date',100)]);
      const items=extras.map(extra=>{const reviews=ratings.filter(item=>item.extra_id===extra.id);const average=reviews.length?reviews.reduce((sum,item)=>sum+item.rating,0)/reviews.length:0;const {date_of_birth,address,email,phone,last_name,created_by,created_by_id,...publicExtra}=extra;return {...publicExtra,last_name:extra.display_last_name?last_name:'',email:extra.display_email?email:'',phone:extra.display_phone?phone:'',age:ageFrom(date_of_birth),average_rating:average,recommendation_count:reviews.length,recommendations:reviews.map(({rating,comment,caterer_name,mission_date})=>({rating,comment,caterer_name,mission_date}))}});
      return Response.json({items,requests,caterer:caterer?{id:caterer.id,business_name:caterer.business_name}:null});
    }
    if(body.action==='contact'){
      const data=body.data||{}; const message=cleanText(data.message);
      if(!data.extra_id||message.length<10)return Response.json({error:'Écrivez un message d’au moins 10 caractères'},{status:400});
      const extra=await base44.asServiceRole.entities.ExtraProfile.get(data.extra_id); if(!extra?.active)return Response.json({error:'Profil indisponible'},{status:404});
      const recipient=extra.created_by||extra.email; if(!recipient)return Response.json({error:'Cet Extra ne peut pas recevoir de message'},{status:400});
      await base44.asServiceRole.integrations.Core.SendEmail({to:recipient,from_name:'Un Bon Traiteur',subject:`Nouveau contact de ${cleanText(caterer?.business_name||'Un traiteur')}`,body:`Bonjour ${cleanText(extra.first_name)||''},\n\n${message}\n\nPour répondre à ${cleanText(caterer?.business_name||'ce traiteur')}, écrivez à ${cleanText(user.email)}.\n\nMessage transmis par Un Bon Traiteur.`});
      return Response.json({sent:true});
    }
    if(body.action==='create_request'){const data=body.data||{};if(!data.role||!data.event_date||!data.location||!data.description)return Response.json({error:'Informations de mission incomplètes'},{status:400});const created=await base44.entities.ExtraRequest.create({...data,caterer_id:caterer.id,required_count:Number(data.required_count)||1,hourly_rate:Number(data.hourly_rate)||undefined,status:'open'});return Response.json({item:created});}
    if(body.action==='recommend'){const data=body.data||{};const rating=Number(data.rating);if(!data.extra_id||rating<1||rating>5||!data.comment)return Response.json({error:'Note et recommandation requises'},{status:400});const existing=await base44.entities.ExtraRecommendation.filter({extra_id:data.extra_id,caterer_id:caterer.id},'-created_date',1);const payload={extra_id:data.extra_id,caterer_id:caterer.id,caterer_name:caterer.business_name,rating,comment:data.comment,mission_date:data.mission_date||undefined};const item=existing[0]?await base44.entities.ExtraRecommendation.update(existing[0].id,payload):await base44.entities.ExtraRecommendation.create(payload);return Response.json({item});}
    return Response.json({error:'Action inconnue'},{status:400});
  } catch(error) { console.error('extrasHub',error); return Response.json({error:error.message},{status:500}); }
}