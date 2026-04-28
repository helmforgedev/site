import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { getBlogRssItems } from '../../lib/blogFeed';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog');
  const feedUrl = new URL('/blog/rss.xml', context.site).toString();

  return rss({
    title: 'HelmForge Blog',
    description: 'Kubernetes, Helm, and HelmForge operations guides, announcements, and technical analysis.',
    site: new URL('/blog', context.site!),
    items: getBlogRssItems(posts, context.site!),
    trailingSlash: false,
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
      dc: 'http://purl.org/dc/elements/1.1/',
      media: 'http://search.yahoo.com/mrss/',
    },
    customData: `
      <language>en</language>
      <generator>Astro</generator>
      <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
      <image>
        <url>https://helmforge.dev/favicon-512.png</url>
        <title>HelmForge Blog</title>
        <link>https://helmforge.dev/blog</link>
      </image>
    `,
  });
}
