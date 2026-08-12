import {useEffect,useState} from 'react';
import {Navigate,Outlet} from 'react-router-dom';
import {base44} from '@/api/base44Client';
import {useAuth} from '@/lib/AuthContext';

export default function AccountTypeRoute({type}){
  const {user}=useAuth();
  const[allowed,setAllowed]=useState(null);
  useEffect(()=>{if(user?.role==='admin'){setAllowed(true);return}const check=async()=>{if(user?.account_type===type){setAllowed(true);return}if(type==='caterer'){const items=await base44.entities.CatererProfile.filter({created_by_id:user.id},'-created_date',1);setAllowed(Boolean(items.length));return}if(type==='extra'){const items=await base44.entities.ExtraProfile.filter({created_by_id:user.id},'-created_date',1);setAllowed(items[0]?.status==='approved');return}if(type==='employee'){const items=await base44.entities.Employee.filter({email:user.email},'-created_date',1);setAllowed(Boolean(items.length));return}setAllowed(false)};check()},[type,user]);
  if(allowed===null)return <div className="min-h-screen animate-pulse bg-muted"/>;
  return allowed?<Outlet/>:<Navigate to="/mon-espace" replace/>;
}