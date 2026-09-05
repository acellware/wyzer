import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';

// Single unified site: marketing at the root, the Compliance Navigator
// under /navigator. One domain.
export default defineConfig({
  site: 'https://wyzer.acellhq.com',
  integrations: [
    react(),
    mdx(),
    tailwind({ applyBaseStyles: false }),
  ],
});
