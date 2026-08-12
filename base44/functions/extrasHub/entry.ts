import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geocodeLocation, distanceKm } from '../../shared/geolocation.ts';

function ageFrom(date) { if (!date) return null; const birth=new Date(`${date}T00:00:00`); const today=new Date(); let age=today.getFullYear()-birth.getFullYear(); if(today.getMonth()<birth.getMonth()||(today.getMonth()===birth.getMonth()&&today.getDate()<birth.getDate()))age--; return age; }
function cleanText(value) { return String(value||'').replace(/[<>&]/g,'').trim(); }

export default async function(req: Request): Promise<Response> {
  try {
    const base44=createClientFromRequest(req); const user=await base44.auth.me();
    if(!user)return Response.json({error:'Non autorisé'},{status:401});
    const body=await req.json();
    if(body.action==='delete_account'){
      if(body.confirmation!==true)return Response.json({error:'Confirmation requise'},{status:400});
      const profiles=await base44.asServiceRole.entities.ExtraProfile.filter({created_by_id:user.id},'-created_date',20);
      if(!profiles.length&&user.account_type!=='extra')return Response.json({error:'Aucun compte Extra associé'},{status:403});
      if(profiles.some(item=>item.stripe_subscription_id))await base44.functions.invoke('extraSubscription',{action:'cancel_for_deletion'});
      const profileIds=profiles.map(item=>item.id);
      const [bookings,assignments]=await Promise.all([
        base44.asServiceRole.entities.ExtraBooking.filter({extra_user_id:user.id},'-created_date',500),
        base44.asServiceRole.entities.StaffAssignment.filter({$or:[{assignee_user_id:user.id},{assignee_email:user.email}]},'-created_date',500)
      ]);
      if(bookings.length)await base44.asServiceRole.entities.ExtraBooking.bulkUpdate(bookings.map(item=>({id:item.id,extra_name:'Compte supprimé',extra_phone:'',extra_email:'',extra_city:'',extra_skills:[],extra_experience:''})));
      if(assignments.length)await base44.asServiceRole.entities.StaffAssignment.bulkUpdate(assignments.map(item=>({id:item.id,assignee_name:'Compte supprimé',assignee_email:'compte-supprime@invalid.local',assignee_user_id:''})));
      if(profileIds.length){
        await base44.asServiceRole.entities.ExtraRecommendation.deleteMany({extra_id:{$in:profileIds}});
        await base44.asServiceRole.entities.ExtraProfile.deleteMany({id:{$in:profileIds}});
      }
      await base44.asServiceRole.entities.User.delete(user.id);
      return Response.json({deleted:true});
    }
    if(body.action==='admin_email'){
      if(user.role!=='admin')return Response.json({error:'Accès refusé'},{status:403});
      const profile=await base44.asServiceRole.entities.ExtraProfile.get(String(body.profile_id||''));const owner=profile?.created_by_id?await base44.asServiceRole.entities.User.get(profile.created_by_id):null;const subject=cleanText(body.subject).slice(0,120);const message=cleanText(body.message).slice(0,4000);
      if(!owner?.email||!subject||message.length<10)return Response.json({error:'Destinataire, objet ou message invalide'},{status:400});
      await base44.asServiceRole.integrations.Core.SendEmail({to:owner.email,from_name:'Un Bon Traiteur',subject,body:`Bonjour ${cleanText(profile.first_name)},\n\n${message}\n\nL’équipe Un Bon Traiteur`});
      return Response.json({sent:true});
    }
    if(body.action==='save_profile'){
      const input=body.data||{}; const required=['first_name','last_name','email','phone','date_of_birth','address','postal_code','city'];
      if(required.some(field=>!cleanText(input[field])))return Response.json({error:'Complétez tous les champs obligatoires.'},{status:400});
      const caterers=await base44.entities.CatererProfile.filter({created_by_id:user.id},'-created_date',1);
      if(caterers.length)return Response.json({error:'Cette adresse e-mail est déjà associée à un compte traiteur.'},{status:409});
      const {id,status,admin_comment,subscription_plan,subscription_status,stripe_customer_id,stripe_subscription_id,created_by,created_by_id,created_date,updated_date,...profileData}=input;
      const coordinates=await geocodeLocation(`${profileData.address}, ${profileData.postal_code} ${profileData.city}`);
      const existing=await base44.entities.ExtraProfile.filter({created_by_id:user.id},'-created_date',1);
      const nextStatus=existing[0]?.status==='approved'?'approved':'pending';
      const payload={...profileData,...(coordinates||{}),status:nextStatus,admin_comment:'',active:true};
      const item=existing[0]?await base44.asServiceRole.entities.ExtraProfile.update(existing[0].id,payload):await base44.entities.ExtraProfile.create(payload);
      return Response.json({item});
    }
    if(body.action==='extra_opportunities'){
      const extras=await base44.asServiceRole.entities.ExtraProfile.filter({created_by_id:user.id},'-created_date',1); const extra=extras[0];
      if(!extra||extra.status!=='approved')return Response.json({error:'Votre profil Extra doit être validé pour consulter les annonces.'},{status:403});
      const customCoordinates=body.latitude!=null&&body.longitude!=null&&Number.isFinite(Number(body.latitude))&&Number.isFinite(Number(body.longitude))?{latitude:Number(body.latitude),longitude:Number(body.longitude)}:null;
      let origin=customCoordinates||(body.city&&body.city!=='Ma position actuelle'?await geocodeLocation(body.city):null)||(extra.latitude!=null&&extra.longitude!=null?{latitude:extra.latitude,longitude:extra.longitude}:await geocodeLocation(`${extra.address}, ${extra.postal_code} ${extra.city}`));
      if(!origin)return Response.json({error:'La ville recherchée n’a pas pu être localisée.'},{status:400});
      const radius=Math.min(100,Math.max(1,Number(body.radius_km)||25));
      if(extra.latitude==null||extra.longitude==null)await base44.asServiceRole.entities.ExtraProfile.update(extra.id,origin);
      const [requests,caterers,applications]=await Promise.all([base44.asServiceRole.entities.ExtraRequest.filter({status:'open'},'-event_date',500),base44.asServiceRole.entities.CatererProfile.list('-created_date',500),base44.asServiceRole.entities.ExtraBooking.filter({extra_user_id:user.id},'-created_date',500)]);
      const enriched=await Promise.all(requests.map(async request=>{let coordinates=request.latitude!=null&&request.longitude!=null?{latitude:request.latitude,longitude:request.longitude}:await geocodeLocation(request.location);if(coordinates&&(request.latitude==null||request.longitude==null))await base44.asServiceRole.entities.ExtraRequest.update(request.id,coordinates);const caterer=caterers.find(item=>item.id===request.caterer_id);const application=applications.find(item=>item.extra_request_id===request.id);return coordinates?{...request,caterer_name:caterer?.business_name||'Traiteur',caterer_slug:caterer?.slug||'',caterer_logo_url:caterer?.logo_url||'',distance_km:distanceKm(origin.latitude,origin.longitude,coordinates.latitude,coordinates.longitude),application_status:application?.status||null}:null;}));
      return Response.json({city:body.city||extra.city,radius_km:radius,items:enriched.filter(item=>item&&item.distance_km<=radius&&item.distance_km<=Number(item.radius_km||15)&&item.event_date>=new Date().toISOString().slice(0,10))});
    }
    if(body.action==='view_request'){
      const request=await base44.asServiceRole.entities.ExtraRequest.get(body.request_id); if(!request)return Response.json({error:'Annonce introuvable'},{status:404});
      const item=await base44.asServiceRole.entities.ExtraRequest.update(request.id,{view_count:Number(request.view_count||0)+1}); return Response.json({view_count:item.view_count});
    }
    if(body.action==='apply_to_request'){
      const extras=await base44.asServiceRole.entities.ExtraProfile.filter({created_by_id:user.id},'-created_date',1); const extra=extras[0];
      if(!extra||extra.status!=='approved'||!extra.active)return Response.json({error:'Votre profil Extra doit être validé.'},{status:403});
      const request=await base44.asServiceRole.entities.ExtraRequest.get(body.request_id); if(!request||request.status!=='open')return Response.json({error:'Cette annonce n’est plus disponible.'},{status:409});
      const existing=await base44.asServiceRole.entities.ExtraBooking.filter({extra_request_id:request.id,extra_user_id:user.id,status:{$in:['pending','confirmed']}},'-created_date',1); if(existing.length)return Response.json({error:'Vous avez déjà candidaté à cette annonce.'},{status:409});
      const caterer=await base44.asServiceRole.entities.CatererProfile.get(request.caterer_id); if(!caterer)return Response.json({error:'Traiteur introuvable'},{status:404});
      const period=request.start_time&&Number(request.start_time.slice(0,2))>=17?'evening':'day';
      const item=await base44.entities.ExtraBooking.create({extra_profile_id:extra.id,extra_user_id:user.id,extra_request_id:request.id,initiated_by:'extra',extra_name:[extra.first_name,extra.last_name].filter(Boolean).join(' '),extra_phone:extra.phone||'',extra_email:extra.email||user.email,extra_city:extra.city||'',extra_skills:extra.skills||[],extra_experience:extra.experience_details||'',caterer_id:caterer.id,caterer_user_id:request.created_by_id,caterer_name:caterer.business_name,caterer_slug:caterer.slug||'',caterer_contact_name:caterer.contact_name||'',caterer_phone:caterer.phone||'',caterer_email:request.created_by||'',caterer_address:caterer.address||'',caterer_city:caterer.city||'',booking_date:request.event_date,period,location:request.location,service_details:request.description,status:'pending'});
      return Response.json({item});
    }
    if(['booking_context','send_booking_message','rate_caterer','respond_booking','cancel_booking','delete_booking'].includes(body.action)){
      const booking=await base44.asServiceRole.entities.ExtraBooking.get(body.booking_id); if(!booking)return Response.json({error:'Demande introuvable'},{status:404});
      const myCaterers=await base44.asServiceRole.entities.CatererProfile.filter({created_by_id:user.id},'-created_date',1); const myCaterer=myCaterers[0];
      const isExtra=booking.extra_user_id===user.id; const isCaterer=booking.created_by_id===user.id||booking.caterer_user_id===user.id||booking.caterer_id===myCaterer?.id;
      if(!isExtra&&!isCaterer&&user.role!=='admin')return Response.json({error:'Accès refusé'},{status:403});
      if(body.action==='booking_context'){
        const [messages,reviews,workedBookings]=await Promise.all([base44.asServiceRole.entities.ExtraBookingMessage.filter({booking_id:booking.id},'created_date',200),base44.asServiceRole.entities.CatererExtraReview.filter({caterer_id:booking.caterer_id},'-created_date',500),base44.asServiceRole.entities.ExtraBooking.filter({extra_user_id:booking.extra_user_id,caterer_id:booking.caterer_id,status:'confirmed'},'-booking_date',500)]);
        const average=reviews.length?reviews.reduce((sum,item)=>sum+Number(item.rating||0),0)/reviews.length:0;const previousMissions=workedBookings.filter(item=>item.id!==booking.id&&item.booking_date<=new Date().toISOString().slice(0,10));const ownReview=reviews.find(item=>item.extra_user_id===booking.extra_user_id)||null;
        return Response.json({messages,average_rating:average,review_count:reviews.length,previous_missions:previousMissions.length,own_review:ownReview,can_rate:isExtra&&booking.status==='confirmed'&&booking.booking_date<=new Date().toISOString().slice(0,10)});
      }
      if(body.action==='send_booking_message'){
        const message=cleanText(body.message).slice(0,2000);if(message.length<2)return Response.json({error:'Écrivez un message d’au moins 2 caractères.'},{status:400});
        const catererUserId=booking.caterer_user_id||booking.created_by_id;const members=[...new Set([booking.extra_user_id,catererUserId].filter(Boolean))];const senderRole=isExtra?'extra':'caterer';const senderName=isExtra?(booking.extra_name||user.full_name||'Extra'):(booking.caterer_name||user.full_name||'Traiteur');const item=await base44.asServiceRole.entities.ExtraBookingMessage.create({booking_id:booking.id,members,sender_user_id:user.id,sender_role:senderRole,sender_name:senderName,message});
        const recipientId=isExtra?catererUserId:booking.extra_user_id;const recipient=recipientId?await base44.asServiceRole.entities.User.get(recipientId):null;const destination=isExtra?'suivi-extras':'inscription-extra';if(recipient?.email)await base44.asServiceRole.integrations.Core.SendEmail({to:recipient.email,from_name:'Un Bon Traiteur',subject:`Nouveau message concernant la mission du ${booking.booking_date}`,body:`Bonjour,\n\n${senderName} vous a envoyé un message :\n\n${message}\n\nRépondez dans la messagerie interne : https://bon-traiteur-go.base44.app/${destination}\n\nUn Bon Traiteur`});
        return Response.json({item,notified:Boolean(recipient?.email)});
      }
      if(body.action==='rate_caterer'){
        if(!isExtra||booking.status!=='confirmed'||booking.booking_date>new Date().toISOString().slice(0,10))return Response.json({error:'Vous pourrez noter ce traiteur après une mission confirmée.'},{status:403});const rating=Number(body.rating);const comment=cleanText(body.comment).slice(0,1000);if(rating<1||rating>5)return Response.json({error:'Choisissez une note entre 1 et 5.'},{status:400});
        const existing=await base44.asServiceRole.entities.CatererExtraReview.filter({caterer_id:booking.caterer_id,extra_user_id:user.id},'-created_date',1);const payload={caterer_id:booking.caterer_id,extra_user_id:user.id,booking_id:booking.id,rating,comment,mission_date:booking.booking_date};const item=existing[0]?await base44.asServiceRole.entities.CatererExtraReview.update(existing[0].id,payload):await base44.entities.CatererExtraReview.create(payload);const reviews=await base44.asServiceRole.entities.CatererExtraReview.filter({caterer_id:booking.caterer_id},'-created_date',500);const average=reviews.reduce((sum,review)=>sum+Number(review.rating||0),0)/reviews.length;return Response.json({item,average_rating:average,review_count:reviews.length});
      }
      if(body.action==='respond_booking'){
        const responderAllowed=user.role==='admin'||(booking.initiated_by==='extra'?isCaterer:isExtra);
        if(!responderAllowed||booking.status!=='pending'||!['confirmed','declined'].includes(body.status))return Response.json({error:'Réponse impossible'},{status:400});
        if(body.status==='confirmed'){
          const extraProfiles=await base44.asServiceRole.entities.ExtraProfile.filter({created_by_id:booking.extra_user_id},'-created_date',1);const extraProfile=extraProfiles[0];
          const unlimited=extraProfile?.subscription_plan==='unlimited'&&extraProfile?.subscription_status==='active';
          if(!unlimited){const month=String(booking.booking_date).slice(0,7);const confirmed=await base44.asServiceRole.entities.ExtraBooking.filter({extra_user_id:booking.extra_user_id,status:'confirmed'},'-booking_date',500);if(confirmed.some(item=>item.id!==booking.id&&String(item.booking_date).startsWith(month)))return Response.json({error:'L’offre gratuite inclut une seule mission confirmée par mois. L’Extra doit activer l’offre illimitée à 10 €/mois.'},{status:402});}
        }
        let payload={status:body.status};
        if(body.status==='confirmed'){payload={...payload,accepted_at:new Date().toISOString()};if(booking.initiated_by!=='extra'){const extras=await base44.asServiceRole.entities.ExtraProfile.filter({created_by_id:user.id},'-created_date',1);const extra=extras[0];payload={...payload,extra_name:[extra?.first_name,extra?.last_name].filter(Boolean).join(' '),extra_phone:extra?.phone||'',extra_email:extra?.email||user.email,extra_city:extra?.city||'',extra_skills:extra?.skills||[],extra_experience:extra?.experience_details||''};}}
        const item=await base44.asServiceRole.entities.ExtraBooking.update(booking.id,payload);
        const staffAssignments=await base44.asServiceRole.entities.StaffAssignment.filter({booking_id:booking.id},'-created_date',20);if(staffAssignments.length)await base44.asServiceRole.entities.StaffAssignment.bulkUpdate(staffAssignments.map(assignment=>({id:assignment.id,status:body.status==='confirmed'?'accepted':'declined',responded_at:new Date().toISOString()})));
        if(booking.extra_request_id&&body.status==='confirmed'){const request=await base44.asServiceRole.entities.ExtraRequest.get(booking.extra_request_id);const confirmed=await base44.asServiceRole.entities.ExtraBooking.filter({extra_request_id:booking.extra_request_id,status:'confirmed'},'-created_date',500);if(request&&confirmed.length>=Number(request.required_count||1))await base44.asServiceRole.entities.ExtraRequest.update(request.id,{status:'filled'});}
        return Response.json({item});
      }
      if(body.action==='cancel_booking'){
        if(!['pending','confirmed'].includes(booking.status))return Response.json({error:'Cette demande ne peut plus être annulée'},{status:400});
        const item=await base44.asServiceRole.entities.ExtraBooking.update(booking.id,{status:'cancelled',cancelled_at:new Date().toISOString(),cancelled_by:isExtra?'extra':'caterer'});
        const staffAssignments=await base44.asServiceRole.entities.StaffAssignment.filter({booking_id:booking.id},'-created_date',20);if(staffAssignments.length)await base44.asServiceRole.entities.StaffAssignment.bulkUpdate(staffAssignments.map(assignment=>({id:assignment.id,status:'cancelled',responded_at:new Date().toISOString()})));
        if(booking.extra_request_id)await base44.asServiceRole.entities.ExtraRequest.update(booking.extra_request_id,{status:'open'});
        let notificationSent=false;let emailSent=false;
        if(isExtra){
          const catererUserId=booking.caterer_user_id||booking.created_by_id;const catererUser=catererUserId?await base44.asServiceRole.entities.User.get(catererUserId):null;const recipientEmail=catererUser?.email||booking.caterer_email;const missionDate=new Date(`${booking.booking_date}T12:00:00`).toLocaleDateString('fr-FR');const extraName=cleanText(booking.extra_name||user.full_name||'Un Extra');const prestation=cleanText(booking.service_details||'la prestation prévue');const message=`Attention, ${extraName} vient d’annuler sa participation du ${missionDate} pour la prestation « ${prestation} ». L’annonce a été rouverte afin de rechercher un remplaçant.`;const operations=[];
          if(catererUserId)operations.push(base44.asServiceRole.entities.UserNotification.create({target_user_id:catererUserId,type:'extra_cancellation',title:`Annulation pour le ${missionDate}`,message,link:'/suivi-extras?tab=tracking',related_id:booking.id}).then(()=>{notificationSent=true}));
          if(recipientEmail)operations.push(base44.asServiceRole.integrations.Core.SendEmail({to:recipientEmail,from_name:'Un Bon Traiteur',subject:`Attention — ${extraName} a annulé la mission du ${missionDate}`,body:`Bonjour ${cleanText(booking.caterer_contact_name||booking.caterer_name||'')},\n\n${message}\n\nConsultez immédiatement le suivi de vos Extras :\nhttps://bon-traiteur-go.base44.app/suivi-extras?tab=tracking\n\nUn Bon Traiteur`}).then(()=>{emailSent=true}));
          const results=await Promise.allSettled(operations);results.filter(result=>result.status==='rejected').forEach(result=>console.error('Alerte annulation Extra',result.reason));
        }
        return Response.json({item,notification_sent:notificationSent,email_sent:emailSent});
      }
      if(!['declined','cancelled','expired'].includes(booking.status))return Response.json({error:'Annulez d’abord la demande avant de la supprimer'},{status:400});
      await base44.asServiceRole.entities.ExtraBooking.delete(booking.id); return Response.json({deleted:true});
    }
    if(body.action==='profile_stats'){
      const profile=await base44.asServiceRole.entities.ExtraProfile.get(String(body.profile_id||''));
      if(!profile||(profile.created_by_id!==user.id&&user.role!=='admin'))return Response.json({error:'Accès refusé'},{status:403});
      const views=await base44.asServiceRole.entities.ExtraProfileView.filter({profile_id:profile.id},'-created_date',500);
      return Response.json({views:views.length});
    }
    if(body.action==='view_profile'){
      const catererProfiles=await base44.asServiceRole.entities.CatererProfile.filter({created_by_id:user.id},'-created_date',1);
      if(user.role!=='admin'&&!catererProfiles.length)return Response.json({error:'Accès réservé aux traiteurs'},{status:403});
      const profile=await base44.asServiceRole.entities.ExtraProfile.get(String(body.profile_id||''));if(!profile||profile.status!=='approved')return Response.json({error:'Profil indisponible'},{status:404});
      const viewDay=new Date().toISOString().slice(0,10);const existing=await base44.asServiceRole.entities.ExtraProfileView.filter({profile_id:profile.id,viewer_user_id:user.id,view_day:viewDay},'-created_date',1);
      if(!existing.length)await base44.asServiceRole.entities.ExtraProfileView.create({profile_id:profile.id,viewer_user_id:user.id,view_day:viewDay});
      return Response.json({viewed:true});
    }
    const profiles=await base44.entities.CatererProfile.filter({created_by_id:user.id},'-created_date',1); const caterer=profiles[0];
    if(user.role!=='admin'&&!caterer)return Response.json({error:'Accès réservé aux traiteurs'},{status:403});
    if(body.action==='directory'){
      const [extras,ratings,requests,bookings,allBookings]=await Promise.all([base44.asServiceRole.entities.ExtraProfile.filter({active:true,available:true,status:'approved'},'-updated_date',500),base44.asServiceRole.entities.ExtraRecommendation.list('-created_date',1000),base44.entities.ExtraRequest.list('-created_date',100),base44.asServiceRole.entities.ExtraBooking.filter({status:{$in:['pending','confirmed']}},'-booking_date',1000),base44.asServiceRole.entities.ExtraBooking.list('-created_date',500)]); const myBookings=allBookings.filter(item=>item.created_by_id===user.id||item.caterer_user_id===user.id||item.caterer_id===caterer?.id).map(booking=>({...booking,extra_photo_url:extras.find(extra=>extra.id===booking.extra_profile_id)?.photo_urls?.[0]||''}));
      const items=extras.map(extra=>{const reviews=ratings.filter(item=>item.extra_id===extra.id);const average=reviews.length?reviews.reduce((sum,item)=>sum+item.rating,0)/reviews.length:0;const {date_of_birth,address,email,phone,last_name,created_by,created_by_id,...publicExtra}=extra;return {...publicExtra,last_name:extra.display_last_name?last_name:'',email:extra.display_email?email:'',phone:extra.display_phone?phone:'',age:ageFrom(date_of_birth),average_rating:average,recommendation_count:reviews.length,booking_days:bookings.filter(item=>item.extra_profile_id===extra.id).map(({booking_date,status})=>({booking_date,status})),recommendations:reviews.map(({rating,comment,caterer_name,mission_date})=>({rating,comment,caterer_name,mission_date}))}});
      return Response.json({items,requests,bookings:myBookings,caterer:caterer?{id:caterer.id,business_name:caterer.business_name}:null});
    }
    if(body.action==='book_extra'){
      const data=body.data||{}; const dates=[...new Set(data.dates||[])];
      if(!data.extra_id||!dates.length||!cleanText(data.location)||!cleanText(data.service_details))return Response.json({error:'Sélectionnez un jour et renseignez le lieu et la prestation.'},{status:400});
      const extra=await base44.asServiceRole.entities.ExtraProfile.get(data.extra_id); if(!extra?.active||extra.status!=='approved')return Response.json({error:'Profil indisponible'},{status:404});
      const slots=new Map((extra.availability_slots||[]).map(slot=>[slot.date,slot.period])); if(dates.some(date=>!slots.has(date)))return Response.json({error:'Un jour sélectionné n’est plus disponible.'},{status:409});
      const existing=await base44.asServiceRole.entities.ExtraBooking.filter({extra_profile_id:extra.id,status:{$in:['pending','confirmed']}},'-booking_date',500); if(dates.some(date=>existing.some(item=>item.booking_date===date)))return Response.json({error:'Un jour sélectionné vient d’être réservé.'},{status:409});
      const items=dates.map(date=>({extra_profile_id:extra.id,extra_user_id:extra.created_by_id,initiated_by:'caterer',extra_name:extra.first_name||'Extra',caterer_id:caterer.id,caterer_user_id:user.id,caterer_name:caterer.business_name,caterer_slug:caterer.slug||'',caterer_contact_name:caterer.contact_name||'',caterer_phone:caterer.phone||'',caterer_email:user.email||'',caterer_address:caterer.address||'',caterer_city:caterer.city||'',booking_date:date,period:slots.get(date),location:cleanText(data.location),service_details:cleanText(data.service_details),status:'pending'})); const created=await base44.entities.ExtraBooking.bulkCreate(items); return Response.json({items:created});
    }
    if(body.action==='contact'){
      const data=body.data||{}; const message=cleanText(data.message);
      if(!data.extra_id||message.length<10)return Response.json({error:'Écrivez un message d’au moins 10 caractères'},{status:400});
      const extra=await base44.asServiceRole.entities.ExtraProfile.get(data.extra_id); if(!extra?.active||extra.status!=='approved')return Response.json({error:'Profil indisponible'},{status:404});
      const recipient=extra.created_by||extra.email; if(!recipient)return Response.json({error:'Cet Extra ne peut pas recevoir de message'},{status:400});
      await base44.asServiceRole.integrations.Core.SendEmail({to:recipient,from_name:'Un Bon Traiteur',subject:`Nouveau contact de ${cleanText(caterer?.business_name||'Un traiteur')}`,body:`Bonjour ${cleanText(extra.first_name)||''},\n\n${message}\n\nPour répondre à ${cleanText(caterer?.business_name||'ce traiteur')}, écrivez à ${cleanText(user.email)}.\n\nMessage transmis par Un Bon Traiteur.`});
      return Response.json({sent:true});
    }
    if(body.action==='create_request'){const data=body.data||{};if(!data.role||!data.event_date||!data.location||!data.description)return Response.json({error:'Informations de mission incomplètes'},{status:400});const coordinates=data.latitude!=null&&data.longitude!=null?{latitude:Number(data.latitude),longitude:Number(data.longitude)}:await geocodeLocation(data.location);const created=await base44.entities.ExtraRequest.create({...data,...(coordinates||{}),caterer_id:caterer.id,radius_km:Math.min(100,Math.max(1,Number(data.radius_km)||15)),required_count:Number(data.required_count)||1,hourly_rate:Number(data.hourly_rate)||undefined,view_count:0,status:'open'});return Response.json({item:created});}
    if(body.action==='update_request'){const data=body.data||{};const requests=await base44.entities.ExtraRequest.list('-created_date',500);const request=requests.find(item=>item.id===body.request_id);if(!request)return Response.json({error:'Annonce introuvable'},{status:404});if(!data.role||!data.event_date||!data.location||!data.description)return Response.json({error:'Informations de mission incomplètes'},{status:400});const coordinates=data.latitude!=null&&data.longitude!=null?{latitude:Number(data.latitude),longitude:Number(data.longitude)}:await geocodeLocation(data.location);const item=await base44.entities.ExtraRequest.update(request.id,{role:data.role,event_date:data.event_date,start_time:data.start_time||'',end_time:data.end_time||'',location:data.location,...(coordinates||{}),radius_km:Math.min(100,Math.max(1,Number(data.radius_km)||15)),required_count:Number(data.required_count)||1,hourly_rate:Number(data.hourly_rate)||undefined,description:data.description});return Response.json({item});}
    if(body.action==='delete_request'){const requests=await base44.entities.ExtraRequest.list('-created_date',500);const request=requests.find(item=>item.id===body.request_id);if(!request)return Response.json({error:'Annonce introuvable'},{status:404});const applications=await base44.asServiceRole.entities.ExtraBooking.filter({extra_request_id:request.id,status:{$in:['pending','confirmed']}},'-created_date',500);if(applications.length)await base44.asServiceRole.entities.ExtraBooking.bulkUpdate(applications.map(item=>({id:item.id,status:'cancelled',cancelled_at:new Date().toISOString(),cancelled_by:'caterer'})));await base44.entities.ExtraRequest.delete(request.id);return Response.json({deleted:true});}
    if(body.action==='recommend'){const data=body.data||{};const rating=Number(data.rating);if(!data.extra_id||rating<1||rating>5||!data.comment)return Response.json({error:'Note et recommandation requises'},{status:400});const existing=await base44.entities.ExtraRecommendation.filter({extra_id:data.extra_id,caterer_id:caterer.id},'-created_date',1);const payload={extra_id:data.extra_id,caterer_id:caterer.id,caterer_name:caterer.business_name,rating,comment:data.comment,mission_date:data.mission_date||undefined};const item=existing[0]?await base44.entities.ExtraRecommendation.update(existing[0].id,payload):await base44.entities.ExtraRecommendation.create(payload);return Response.json({item});}
    return Response.json({error:'Action inconnue'},{status:400});
  } catch(error) { console.error('extrasHub',error); return Response.json({error:error.message},{status:500}); }
}