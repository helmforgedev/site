// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

const SITE_URL = 'https://helmforge.dev';
const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'blog');

function getFrontmatterScalar(frontmatter, key) {
  const regex = new RegExp(`^${key}:\\s*(.+)$`, 'm');
  const match = frontmatter.match(regex);
  if (!match) return undefined;
  return match[1].trim().replace(/^['"]|['"]$/g, '');
}

function getBlogSitemapMetadata() {
  if (!fs.existsSync(BLOG_DIR)) return new Map();

  return new Map(
    fs
      .readdirSync(BLOG_DIR)
      .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
      .map((file) => {
        const slug = path.basename(file, path.extname(file));
        const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
        const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
        const coverImage = getFrontmatterScalar(frontmatter, 'coverImage');
        const coverAlt = getFrontmatterScalar(frontmatter, 'coverAlt');
        const date =
          getFrontmatterScalar(frontmatter, 'updatedAt') ??
          getFrontmatterScalar(frontmatter, 'publishDate') ??
          getFrontmatterScalar(frontmatter, 'date');

        return [
          `${SITE_URL}/blog/${slug}`,
          {
            coverImage,
            coverAlt,
            lastmod: date ? new Date(date) : undefined,
          },
        ];
      }),
  );
}

/** @type {Map<string, { coverImage?: string, coverAlt?: string, lastmod?: Date }> | undefined} */
let blogSitemapMetadata;

function getCachedBlogSitemapMetadata() {
  blogSitemapMetadata ??= getBlogSitemapMetadata();
  return blogSitemapMetadata;
}

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
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
      namespaces: {
        image: true,
      },
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
          const metadata = getCachedBlogSitemapMetadata().get(url.replace(/\/$/, ''));
          if (metadata?.coverImage) {
            /** @type {any} */ (item).img = [
              {
                url: `${SITE_URL}${metadata.coverImage}`,
                title: metadata.coverAlt,
              },
            ];
          }
          return { ...item, lastmod: metadata?.lastmod, priority: 0.7, changefreq: 'never' };
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
