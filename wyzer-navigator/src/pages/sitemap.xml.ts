import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Content-driven sitemap. Enumerates every static route from the collections so
// it stays in sync as topics/trees grow (no integration version pinning needed).
export const GET: APIRoute = async ({ site }) => {
  const origin = (site?.toString() ?? 'https://navigator.wyzer.io/').replace(/\/$/, '');

  const paths = new Set<string>(['/', '/search', '/cloud', '/industry', '/privacy', '/terms', '/cookies']);

  const cloud = await getCollection('cloud');
  for (const provider of cloud) {
    paths.add(`/cloud/${provider.id}`);
    for (const category of provider.data.categories) {
      paths.add(`/cloud/${provider.id}/${category.slug}`);
      for (const resource of category.resources) {
        paths.add(`/cloud/${provider.id}/${category.slug}/${resource.slug}`);
      }
    }
  }

  const industry = await getCollection('industry');
  for (const ind of industry) {
    paths.add(`/industry/${ind.id}`);
    for (const fn of ind.data.functions) {
      paths.add(`/industry/${ind.id}/${fn.slug}`);
    }
  }

  const topics = await getCollection('topics');
  for (const topic of topics) {
    paths.add(`/topic/${topic.slug}`);
    for (const card of topic.data.cards) {
      paths.add(`/topic/${topic.slug}/${card.framework}`);
    }
  }

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    [...paths]
      .sort()
      .map((p) => `  <url><loc>${origin}${p}</loc></url>`)
      .join('\n') +
    '\n</urlset>\n';

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
