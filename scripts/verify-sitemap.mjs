import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://helmforge.dev';
const distDir = path.join(process.cwd(), 'dist');
const sitemapPath = path.join(distDir, 'sitemap-0.xml');

function walkHtml(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'pagefind' || entry.name === '_astro') return [];
      return walkHtml(fullPath);
    }
    return entry.isFile() && entry.name.endsWith('.html') ? [fullPath] : [];
  });
}

function pageUrl(filePath) {
  const relative = path.relative(distDir, filePath).replaceAll(path.sep, '/');
  if (relative === '404.html') return null;
  if (relative === 'index.html') return SITE_URL;
  return `${SITE_URL}/${relative.replace(/\/index\.html$/, '')}`;
}

if (!fs.existsSync(sitemapPath)) {
  console.error('ERROR: dist/sitemap-0.xml was not generated.');
  process.exit(1);
}

const sitemap = fs.readFileSync(sitemapPath, 'utf8');
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]));
const pageUrls = new Set(walkHtml(distDir).map(pageUrl).filter(Boolean));

const missing = [...pageUrls].filter((url) => !sitemapUrls.has(url)).sort();
const extra = [...sitemapUrls].filter((url) => !pageUrls.has(url)).sort();

console.log(`Sitemap URLs: ${sitemapUrls.size}`);
console.log(`HTML pages: ${pageUrls.size}`);

if (missing.length > 0 || extra.length > 0) {
  for (const url of missing) console.error(`MISSING_FROM_SITEMAP ${url}`);
  for (const url of extra) console.error(`EXTRA_IN_SITEMAP ${url}`);
  process.exit(1);
}

console.log('Sitemap covers every generated indexable HTML page.');
