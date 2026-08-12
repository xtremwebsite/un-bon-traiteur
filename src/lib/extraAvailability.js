const toLocalDate = date => {
  const year=date.getFullYear(); const month=String(date.getMonth()+1).padStart(2,'0'); const day=String(date.getDate()).padStart(2,'0');
  return `${year}-${month}-${day}`;
};

export const getAvailabilityMonth = (offset=0) => {const now=new Date();const first=new Date(now.getFullYear(),now.getMonth()+offset,1,12);const last=new Date(now.getFullYear(),now.getMonth()+offset+1,0,12);return Array.from({length:last.getDate()},(_,index)=>toLocalDate(new Date(first.getFullYear(),first.getMonth(),index+1,12)));};
export const getAvailabilityWindow = () => {const today=toLocalDate(new Date());return [0,1,2].flatMap(getAvailabilityMonth).filter(date=>date>=today);};
export const getAvailabilityPreset = (preset,monthOffset=0) => {const today=toLocalDate(new Date());return getAvailabilityMonth(monthOffset).filter(value=>{if(value<today)return false;const day=new Date(`${value}T12:00:00`).getDay();if(preset==='weekends')return day===0||day===6;if(preset==='weekdays')return day>=1&&day<=5;return true})};
export const sanitizeAvailabilitySlots = values => {const allowed=new Set(getAvailabilityWindow());const periods=new Set(['day','evening','both']);const unique=new Map();(values||[]).forEach(slot=>{if(allowed.has(slot?.date)&&periods.has(slot?.period))unique.set(slot.date,{date:slot.date,period:slot.period})});return [...unique.values()].sort((a,b)=>a.date.localeCompare(b.date))};
export const normalizeAvailabilitySlots = (slots,dates,period='day') => sanitizeAvailabilitySlots(slots?.length?slots:(dates||[]).map(date=>({date,period:period==='evening'?'evening':'day'})));
export const sanitizeAvailabilityDates = values => {const allowed=new Set(getAvailabilityWindow());return (values||[]).filter(value=>allowed.has(value)).sort()};
export const formatAvailabilityDate = value => new Intl.DateTimeFormat('fr-FR',{weekday:'short',day:'numeric',month:'short'}).format(new Date(`${value}T12:00:00`));