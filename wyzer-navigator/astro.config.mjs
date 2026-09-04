import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';

// Navigator lives at its own subdomain.
// NOTE: @astrojs/sitemap is wired up in Phase 3 (SEO) against a pinned,
// Astro-4-compatible version.
export default defineConfig({
  site: 'https://wyzernavigator.acellhq.com',
  integrations: [
    react(),
    mdx(),
    tailwind({ applyBaseStyles: false }),
  ],
});
