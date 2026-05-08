import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { charts } from '../data/charts';
import { getBlogRssItems } from '../lib/blogFeed';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog');
  const blogItems = getBlogRssItems(posts, context.site!);

  const chartItems = charts.map((chart) => ({
    title: `${chart.name} — ${chart.maturity}`,
    description: chart.description,
    link: `/docs/charts/${chart.slug}`,
  }));

  const feedUrl = new URL('/rss.xml', context.site).toString();

  return rss({
    title: 'HelmForge',
    description: 'Production-ready Helm charts for Kubernetes. The open-source alternative to Bitnami.',
    site: context.site!,
    items: [...blogItems, ...chartItems],
    trailingSlash: true,
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
        <title>HelmForge</title>
        <link>https://helmforge.dev/</link>
      </image>
    `,
  });
}
