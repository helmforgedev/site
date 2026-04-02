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

  return rss({
    title: 'HelmForge',
    description: 'Production-ready Helm charts for Kubernetes. The open-source alternative to Bitnami.',
    site: context.site!.toString(),
    items: [...blogItems, ...chartItems],
    customData: '<language>en-us</language>',
  });
}
