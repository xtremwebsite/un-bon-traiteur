import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const domain = 'https://unbontraiteur.com';
const escapeXml = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const caterers = await base44.asServiceRole.entities.CatererProfile.filter({ published: true, status: 'approved' }, '-updated_date', 5000);
    const publicPages = [
      ['/', '1.0', 'daily'],
      ['/recherche', '0.9', 'daily'],
      ['/carte', '0.8', 'daily'],
      ['/demande-devis', '0.8', 'monthly'],
      ['/urgence-traiteur', '0.8', 'monthly'],
      ['/guides', '0.7', 'weekly'],
      ['/referencement', '0.5', 'monthly'],
      ['/espace-traiteur', '0.5', 'monthly']
    ];
    const pageUrls = publicPages.map(([path, priority, changefreq]) => `<url><loc>${domain}${path}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`).join('');
    const catererUrls = caterers.filter((item) => item.slug).map((item) => {
      const location = `${domain}/traiteurs/${encodeURIComponent(item.slug)}`;
      const lastmod = item.updated_date ? `<lastmod>${new Date(item.updated_date).toISOString()}</lastmod>` : '';
      return `<url><loc>${escapeXml(location)}</loc>${lastmod}<changefreq>weekly</changefreq><priority>0.8</priority></url>`;
    }).join('');
    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pageUrls}${catererUrls}</urlset>`;
    return new Response(xml, { status: 200, headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
  } catch (error) {
    console.error('Sitemap generation failed', error);
    return Response.json({ error: 'Impossible de générer le sitemap.' }, { status: 500 });
  }
}