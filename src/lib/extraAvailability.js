const toLocalDate = date => {
  const year=date.getFullYear(); const month=String(date.getMonth()+1).padStart(2,'0'); const day=String(date.getDate()).padStart(2,'0');
  return `${year}-${month}-${day}`;
};

export const getAvailabilityWindow = () => Array.from({length:30},(_,index)=>{const date=new Date();date.setHours(12,0,0,0);date.setDate(date.getDate()+index);return toLocalDate(date)});
export const sanitizeAvailabilityDates = values => {const allowed=new Set(getAvailabilityWindow());return (values||[]).filter(value=>allowed.has(value)).sort()};
export const formatAvailabilityDate = value => new Intl.DateTimeFormat('fr-FR',{weekday:'short',day:'numeric',month:'short'}).format(new Date(`${value}T12:00:00`));