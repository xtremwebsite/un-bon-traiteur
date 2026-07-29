const unique = values => [...new Set(values.filter(Boolean))];

export function withSeoDefaults(profile) {
  const name = profile.business_name || 'Votre établissement';
  const city = profile.city || 'votre ville';
  const events = profile.event_types || [];
  const formats = profile.formats || [];
  const specialty = [...events, ...formats].slice(0, 3).join(', ');
  const generatedDescription = `${name}, traiteur à ${city}${specialty ? ` spécialisé en ${specialty}` : ''}. Prestations sur mesure pour vos événements.`;
  return {
    ...profile,
    seo_title: profile.seo_title || `${name} — Traiteur à ${city}`.slice(0, 65),
    seo_description: profile.seo_description || (profile.description || generatedDescription).slice(0, 160),
    geo_summary: profile.geo_summary || `${name} accompagne particuliers et entreprises à ${city} et dans un rayon de ${profile.service_radius_km || 50} km${specialty ? ` pour des prestations de ${specialty}` : ''}.`,
    service_areas: profile.service_areas?.length ? profile.service_areas : [profile.city].filter(Boolean),
    seo_keywords: profile.seo_keywords?.length ? profile.seo_keywords : unique([`traiteur ${city}`, ...events.map(item => `${item} ${city}`), ...formats.map(item => `${item} traiteur ${city}`)]).slice(0, 8)
  };
}