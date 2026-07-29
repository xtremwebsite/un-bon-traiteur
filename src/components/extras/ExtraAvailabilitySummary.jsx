import {CalendarDays} from 'lucide-react';
import {formatAvailabilityDate,sanitizeAvailabilityDates} from '@/lib/extraAvailability';

export default function ExtraAvailabilitySummary({dates}) {
  const upcoming=sanitizeAvailabilityDates(dates);
  if(!upcoming.length)return <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays size={16}/>Aucune disponibilité renseignée sur les 30 prochains jours</p>;
  return <div className="mt-3"><p className="flex items-center gap-2 text-sm font-bold"><CalendarDays size={16}/>Prochaines disponibilités</p><div className="mt-2 flex flex-wrap gap-1">{upcoming.slice(0,5).map(date=><span key={date} className="rounded-full bg-secondary px-2 py-1 text-xs font-semibold capitalize">{formatAvailabilityDate(date)}</span>)}{upcoming.length>5&&<span className="rounded-full border px-2 py-1 text-xs">+{upcoming.length-5}</span>}</div></div>;
}