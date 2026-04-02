import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { charts } from '../data/charts';

export function GET(context: APIContext) {
  return rss({
    title: 'HelmForge Charts',
    description: 'Production-ready Helm charts for Kubernetes. The open-source alternative to Bitnami.',
    site: context.site!.toString(),
    items: charts.map((chart) => ({
      title: `${chart.name} — ${chart.maturity}`,
      description: chart.description,
      link: `/docs/charts/${chart.slug}`,
    })),
    customData: '<language>en-us</language>',
  });
}
