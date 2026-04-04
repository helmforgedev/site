import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { charts } from '../data/charts';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog');

  const blogItems = posts
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: `/blog/${post.id}`,
      pubDate: post.data.date,
    }));

  const chartItems = charts.map((chart) => ({
    title: `${chart.name} — ${chart.maturity}`,
    description: chart.description,
    link: `/docs/charts/${chart.slug}`,
  }));

  const feedUrl = new URL('/rss.xml', context.site).toString();

  return rss({
    title: 'HelmForge',
    description: 'Production-ready Helm charts for Kubernetes. The open-source alternative to Bitnami.',
    site: context.site!.toString(),
    items: [...blogItems, ...chartItems],
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
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
