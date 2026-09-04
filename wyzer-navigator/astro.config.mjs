import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';

// TODO: set to the real production domain before launch.
// NOTE: @astrojs/sitemap is wired up in Phase 3 (SEO) against a pinned,
// Astro-4-compatible version.
export default defineConfig({
  site: 'https://navigator.wyzer.io',
  integrations: [
    react(),
    mdx(),
    tailwind({ applyBaseStyles: false }),
  ],
});
