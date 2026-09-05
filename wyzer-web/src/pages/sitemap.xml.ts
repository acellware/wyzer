import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Content-driven sitemap. Enumerates every static route from the collections so
// it stays in sync as topics/trees grow (no integration version pinning needed).
export const GET: APIRoute = async ({ site }) => {
  const origin = (site?.toString() ?? 'https://wyzer.acellhq.com/').replace(/\/$/, '');

  // Marketing + legal at the root, Navigator under /navigator.
  const paths = new Set<string>([
    '/',
    '/privacy',
    '/terms',
    '/cookies',
    '/navigator',
    '/navigator/search',
    '/navigator/cloud',
    '/navigator/industry',
  ]);

  const cloud = await getCollection('cloud');
  for (const provider of cloud) {
    paths.add(`/navigator/cloud/${provider.id}`);
    for (const category of provider.data.categories) {
      paths.add(`/navigator/cloud/${provider.id}/${category.slug}`);
      for (const resource of category.resources) {
        paths.add(`/navigator/cloud/${provider.id}/${category.slug}/${resource.slug}`);
      }
    }
  }

  const industry = await getCollection('industry');
  for (const ind of industry) {
    paths.add(`/navigator/industry/${ind.id}`);
    for (const fn of ind.data.functions) {
      paths.add(`/navigator/industry/${ind.id}/${fn.slug}`);
    }
  }

  const topics = await getCollection('topics');
  for (const topic of topics) {
    paths.add(`/navigator/topic/${topic.slug}`);
    for (const card of topic.data.cards) {
      paths.add(`/navigator/topic/${topic.slug}/${card.framework}`);
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
