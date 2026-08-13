import {ChevronRight} from 'lucide-react';
import {Link} from 'react-router-dom';

const regionGroups=[
  [['01','03','07','15','26','38','42','43','63','69','73','74'],'Auvergne-Rhône-Alpes'],[['21','25','39','58','70','71','89','90'],'Bourgogne-Franche-Comté'],[['22','29','35','56'],'Bretagne'],[['18','28','36','37','41','45'],'Centre-Val de Loire'],[['20'],'Corse'],[['08','10','51','52','54','55','57','67','68','88'],'Grand Est'],[['02','59','60','62','80'],'Hauts-de-France'],[['75','77','78','91','92','93','94','95'],'Île-de-France'],[['14','27','50','61','76'],'Normandie'],[['16','17','19','23','24','33','40','47','64','79','86','87'],'Nouvelle-Aquitaine'],[['09','11','12','30','31','32','34','46','48','65','66','81','82'],'Occitanie'],[['44','49','53','72','85'],'Pays de la Loire'],[['04','05','06','13','83','84'],'Provence-Alpes-Côte d’Azur']
];
const overseas={'971':'Guadeloupe','972':'Martinique','973':'Guyane','974':'La Réunion','976':'Mayotte'};
const getRegion=postal=>{const code=String(postal||'');return overseas[code.slice(0,3)]||regionGroups.find(([departments])=>departments.includes(code.slice(0,2)))?.[1]};

export default function CatererBreadcrumb({item}){
  const region=getRegion(item.postal_code)||item.service_areas?.[0]||'Région';
  const crumbs=[item.business_name,'France',region,item.city];
  return <nav aria-label="Fil d’Ariane" className="border-b bg-secondary/55"><div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto whitespace-nowrap px-4 py-3 text-xs text-muted-foreground"><Link to="/" className="font-bold text-primary">Un Bon Traiteur</Link>{crumbs.map((crumb,index)=><span key={`${crumb}-${index}`} className="flex items-center gap-1"><ChevronRight size={13}/><span className={index===crumbs.length-1?'font-semibold text-foreground':''}>{crumb}</span></span>)}</div></nav>;
}