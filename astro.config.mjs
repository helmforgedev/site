// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://helmforge.dev',
  trailingSlash: 'never',

  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        external: ['/pagefind/pagefind.js'],
        onwarn(warning, defaultHandler) {
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
          defaultHandler(warning);
        },
      },
    },
  },

  integrations: [
    mdx(),
    sitemap({
      serialize(item) {
        const match = item.url.match(/\/docs\/charts\/([a-z0-9-]+)$/);
        if (match) {
          const slug = match[1];
          /** @type {any} */ (item).img = [
            {
              url: `https://helmforge.dev/icons/charts/${slug}.png`,
              title: `${slug} Helm chart icon`,
            },
          ];
        }
        return item;
      },
    }),
  ],

  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Outfit',
      cssVariable: '--font-outfit',
    },
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-inter',
    },
    {
      provider: fontProviders.google(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
    },
  ],
});
