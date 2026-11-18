// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

export interface ChartDocContent {
  slug: string;
  title: string;
  description: string;
  html: string;
}

export function getChartDocContent(slug: string): ChartDocContent {
  const siteRoot = process.cwd();
  const candidates = [
    path.resolve(siteRoot, '../charts/charts', slug, 'README.md'),
    path.resolve(siteRoot, '.charts-repo/charts', slug, 'README.md'),
    path.resolve(siteRoot, 'charts', slug, 'README.md'),
  ];
  if (process.env.HELMFORGE_CHARTS_ROOT) {
    candidates.push(path.resolve(process.env.HELMFORGE_CHARTS_ROOT, slug, 'README.md'));
  }

  const file = candidates.find((c) => fs.existsSync(c));
  if (!file) {
    return {
      slug,
      title: slug,
      description: 'Production-ready HelmForge chart.',
      html: '<p>Documentation specification coming soon.</p>',
    };
  }

  let text = fs.readFileSync(file, 'utf8');

  // Extract title from first H1 if present
  let title = slug;
  const titleMatch = text.match(/^#\s+(.*)/m);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  // Remove top badges and main H1 (they are already displayed in the Hero header)
  text = text.replace(/^#\s+.*$/m, '');
  text = text.replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '');
  text = text.replace(/\[!\[.*?\]\(.*?\)\]/g, '');

  // Extract description (first non-empty paragraph without markdown formatting)
  let description = '';
  const firstParagraph = text
    .split('\n\n')
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith('#') && !p.startsWith('>'));
  if (firstParagraph) {
    description = firstParagraph
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/[`*_]/g, '')
      .slice(0, 160);
  }

  // Convert GitHub GFM alerts: > [!NOTE], > [!WARNING], > [!TIP], > [!IMPORTANT], > [!CAUTION]
  text = text.replace(
    /^>\s+\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n([\s\S]*?)(?=\n\n|\n#[^#]|$)/gim,
    (_match, type, content) => {
      const t = type.toUpperCase();
      const cleanContent = content
        .split('\n')
        .map((l: string) => l.replace(/^>\s?/, ''))
        .join('\n')
        .trim();
      let borderClass = 'border-primary/40 bg-primary/5 text-primary-light';
      let iconColor = 'text-primary-light';
      let label = 'Note';

      if (t === 'WARNING' || t === 'CAUTION') {
        borderClass = 'border-amber-500/40 bg-amber-500/5 text-amber-300';
        iconColor = 'text-amber-400';
        label = t === 'CAUTION' ? 'Caution' : 'Warning';
      } else if (t === 'TIP') {
        borderClass = 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300';
        iconColor = 'text-emerald-400';
        label = 'Tip';
      } else if (t === 'IMPORTANT') {
        borderClass = 'border-sky-500/40 bg-sky-500/5 text-sky-300';
        iconColor = 'text-sky-400';
        label = 'Important';
      }

      return `\n<div class="my-6 rounded-xl border p-4 ${borderClass}">
  <div class="flex items-center gap-2 mb-2 font-semibold text-xs tracking-wider uppercase ${iconColor}">
    <span>${label}</span>
  </div>
  <div class="text-sm text-text-base leading-relaxed">
    ${cleanContent}
  </div>
</div>\n`;
    },
  );

  // Convert inline mermaid blocks if present in README
  text = text.replace(/```mermaid\s*\n([\s\S]*?)\n```/g, (_m, code) => {
    return `<div class="my-6 p-4 rounded-xl border border-border-default bg-surface-subtle overflow-x-auto"><pre class="mermaid text-xs font-mono select-all text-text-muted opacity-80">${code.trim()}</pre></div>`;
  });

  // Convert relative markdown links to GitHub repo links
  // e.g. [docs/production.md](docs/production.md) or [DESIGN.md](DESIGN.md)
  text = text.replace(/\[(.*?)\]\(((?!http:\/\/|https:\/\/|mailto:|\/|#).*?)\)/g, (_match, label, relPath) => {
    const ghUrl = `https://github.com/helmforgedev/charts/blob/main/charts/${slug}/${relPath}`;
    return `[${label}](${ghUrl})`;
  });

  // Replace redundant static values/parameters tables with an interactive schema quick-jump banner.
  // Full values reference is rendered dynamically below via <ChartSchemaReference /> from values.schema.json.
  const schemaBanner = `\n\n<div class="my-8 p-5 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4 not-prose">
  <div>
    <div class="flex items-center gap-2 mb-1">
      <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary-light uppercase tracking-wider">Official Schema</span>
      <h3 class="text-base font-semibold text-text-heading m-0">Values & Configuration Reference</h3>
    </div>
    <p class="text-xs text-text-muted leading-relaxed m-0">
      All schema parameters, types, defaults, and allowed values are extracted directly from the chart repository. Filter and search them in the interactive reference below or customize in Values Studio.
    </p>
  </div>
  <a href="#values-schema-reference" class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-all shadow-sm shrink-0 no-underline">
    <span>View Values Schema</span>
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
  </a>
</div>\n\n`;

  // 1. Strip dedicated values/parameters H2 sections containing tables
  const DEDICATED_VAL_SECTION =
    /(^##\s+(?:Main\s+|Key\s+|Default\s+|Important\s+|Configuration\s+|Sharded Cluster\s+)?(?:Values|Parameters)(?:\s+Reference|\s+Table)?\s*\n[\s\S]*?(?=\n##\s|$))/gim;
  text = text.replace(DEDICATED_VAL_SECTION, (match) => {
    if (/\|\s*(?:Key|Parameter|Property|Option|Value)\s*\|/i.test(match)) {
      return schemaBanner;
    }
    return match;
  });

  // 2. Strip any standalone markdown tables whose headers are values/parameters tables (e.g. in ## Configuration)
  const STANDALONE_VAL_TABLE =
    /(?:^|\n)(\|[^\n]*\b(?:Key|Parameter|Property|Option)\b[^\n]*\b(?:Default|Description|Type|Purpose)\b[^\n]*\|\n\|[\s:-|-]+\|\n(?:\|[^\n]+\|\n?)+)/gim;
  text = text.replace(STANDALONE_VAL_TABLE, () => {
    return schemaBanner;
  });

  // 3. Deduplicate consecutive banners if multiple tables existed adjacent to each other
  text = text.replace(/(?:<div class="my-8 p-5 rounded-2xl[^>]*>[\s\S]*?<\/div>\s*){2,}/gi, schemaBanner);

  let html = marked.parse(text, { gfm: true, breaks: false }) as string;

  // Wrap tables in responsive overflow-x-auto container to guarantee mobile layout stability
  html = html.replace(
    /<table/g,
    '<div class="overflow-x-auto my-6 border border-border/40 rounded-xl max-w-full"><table class="w-full text-sm"',
  );
  html = html.replace(/<\/table>/g, '</table></div>');

  return {
    slug,
    title,
    description: description || 'Production-ready HelmForge chart.',
    html,
  };
}
