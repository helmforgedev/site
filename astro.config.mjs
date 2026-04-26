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
        const url = item.url;

        // Homepage
        if (url === 'https://helmforge.dev' || url === 'https://helmforge.dev/') {
          return { ...item, priority: 1.0, changefreq: 'weekly' };
        }

        // Individual chart pages — highest priority (most searched)
        const chartMatch = url.match(/\/docs\/charts\/([a-z0-9-]+)$/);
        if (chartMatch) {
          const slug = chartMatch[1];
          /** @type {any} */ (item).img = [
            {
              url: `https://helmforge.dev/icons/charts/${slug}.png`,
              title: `${slug} Helm chart icon`,
            },
          ];
          return { ...item, priority: 0.9, changefreq: 'monthly' };
        }

        // Charts index and comparison — very high priority
        if (url.includes('/docs/charts') || url.includes('/docs/comparison')) {
          return { ...item, priority: 0.9, changefreq: 'monthly' };
        }

        // Core docs pages
        if (url.includes('/docs/')) {
          return { ...item, priority: 0.8, changefreq: 'monthly' };
        }

        // Blog posts
        if (url.match(/\/blog\/[a-z0-9-]+$/)) {
          return { ...item, priority: 0.7, changefreq: 'never' };
        }

        // Blog index, changelog, roadmap
        if (url.includes('/blog') || url.includes('/changelog') || url.includes('/roadmap')) {
          return { ...item, priority: 0.6, changefreq: 'weekly' };
        }

        // Secondary pages (community, request, stack, newsletter)
        return { ...item, priority: 0.5, changefreq: 'monthly' };
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
