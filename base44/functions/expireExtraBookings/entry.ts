import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
export default async function(req: Request): Promise<Response> {
  try {
    const base44=createClientFromRequest(req); const user=await base44.auth.me();
    if(!user||user.role!=='admin')return Response.json({error:'Forbidden'},{status:403});
    const cutoff=new Date(Date.now()-2*86400000).toISOString();
    const result=await base44.asServiceRole.entities.ExtraBooking.updateMany({status:'pending',created_date:{$lt:cutoff}},{$set:{status:'expired'}});
    return Response.json({ok:true,cutoff,expired:result?.updated||result?.matched||0});
  } catch(error) { console.error('expireExtraBookings',error); return Response.json({error:'Expiration impossible'},{status:500}); }
}