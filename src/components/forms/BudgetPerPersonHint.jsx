export default function BudgetPerPersonHint({budget,guests}){
  const total=Number(budget);const count=Number(guests);
  if(!(total>0&&count>0))return null;
  return <p className="rounded-xl bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground">Soit environ {(total/count).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})} € par personne, à titre indicatif.</p>;
}