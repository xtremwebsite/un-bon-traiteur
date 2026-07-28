import { useEffect } from 'react';

export default function CatererSeo({ item }) {
  useEffect(() => {
    const title = item.seo_title || `${item.business_name} — Traiteur à ${item.city}`;
    const description = item.seo_description || `${item.business_name}, traiteur à ${item.city}. Découvrez ses prestations et demandez un devis personnalisé.`;
    const canonical = `${window.location.origin}/traiteurs/${item.slug}`;
    document.title = title;
    const setMeta = (selector, attributes) => { let element = document.head.querySelector(selector); if (!element) { element = document.createElement('meta'); document.head.appendChild(element); } Object.entries(attributes).forEach(([key,value])=>element.setAttribute(key,value)); };
    setMeta('meta[name="description"]', { name: 'description', content: description });
    setMeta('meta[name="keywords"]', { name: 'keywords', content: (item.seo_keywords || []).join(', ') });
    setMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    setMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    let link = document.head.querySelector('link[rel="canonical"]'); if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); } link.href = canonical;
    const schema = { '@context': 'https://schema.org', '@type': 'LocalBusiness', name: item.business_name, description, url: canonical, image: item.hero_image, telephone: item.phone, address: { '@type': 'PostalAddress', streetAddress: item.address, postalCode: item.postal_code, addressLocality: item.city, addressCountry: 'FR' }, geo: item.latitude && item.longitude ? { '@type': 'GeoCoordinates', latitude: item.latitude, longitude: item.longitude } : undefined, areaServed: (item.service_areas || [item.city]).map(name => ({ '@type': 'Place', name })), priceRange: item.price_from_per_person ? `À partir de ${item.price_from_per_person} € par personne` : undefined };
    let script = document.getElementById('caterer-local-schema'); if (!script) { script = document.createElement('script'); script.id = 'caterer-local-schema'; script.type = 'application/ld+json'; document.head.appendChild(script); } script.textContent = JSON.stringify(schema);
    return () => script?.remove();
  }, [item]);
  return null;
}