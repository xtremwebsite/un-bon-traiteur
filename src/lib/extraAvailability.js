const toLocalDate = date => {
  const year=date.getFullYear(); const month=String(date.getMonth()+1).padStart(2,'0'); const day=String(date.getDate()).padStart(2,'0');
  return `${year}-${month}-${day}`;
};

export const getAvailabilityWindow = () => Array.from({length:30},(_,index)=>{const date=new Date();date.setHours(12,0,0,0);date.setDate(date.getDate()+index);return toLocalDate(date)});
export const getAvailabilityPreset = preset => getAvailabilityWindow().filter(value=>{const day=new Date(`${value}T12:00:00`).getDay();if(preset==='weekends')return day===0||day===6;if(preset==='weekdays')return day>=1&&day<=5;return true});
export const sanitizeAvailabilitySlots = values => {const allowed=new Set(getAvailabilityWindow());const periods=new Set(['day','evening','both']);const unique=new Map();(values||[]).forEach(slot=>{if(allowed.has(slot?.date)&&periods.has(slot?.period))unique.set(slot.date,{date:slot.date,period:slot.period})});return [...unique.values()].sort((a,b)=>a.date.localeCompare(b.date))};
export const normalizeAvailabilitySlots = (slots,dates,period='day') => sanitizeAvailabilitySlots(slots?.length?slots:(dates||[]).map(date=>({date,period:period==='evening'?'evening':'day'})));
export const sanitizeAvailabilityDates = values => {const allowed=new Set(getAvailabilityWindow());return (values||[]).filter(value=>allowed.has(value)).sort()};
export const formatAvailabilityDate = value => new Intl.DateTimeFormat('fr-FR',{weekday:'short',day:'numeric',month:'short'}).format(new Date(`${value}T12:00:00`));