import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = process.env.INDEXNOW_SITE_URL ?? 'https://helmforge.dev';
const ENDPOINT = process.env.INDEXNOW_ENDPOINT ?? 'https://api.indexnow.org/indexnow';
const KEY_FILE = process.env.INDEXNOW_KEY_FILE ?? 'public/helmforge-indexnow-key.txt';
const SOFT_FAIL = process.env.INDEXNOW_SOFT_FAIL === '1' || process.env.INDEXNOW_SOFT_FAIL === 'true';
const DRY_RUN = process.argv.includes('--dry-run');
const ALL_BLOG = process.argv.includes('--all-blog');
const EXPLICIT_URLS = process.argv.filter((arg) => /^https?:\/\//.test(arg));
const site = new URL(SITE_URL);

function readIndexNowKey() {
  const key = fs.readFileSync(KEY_FILE, 'utf8').trim();
  if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) {
    throw new Error(
      `IndexNow key in ${KEY_FILE} must be 8-128 characters and contain only letters, numbers, or dashes.`,
    );
  }
  return key;
}

function getKeyLocation() {
  if (process.env.INDEXNOW_KEY_LOCATION) return process.env.INDEXNOW_KEY_LOCATION;

  const normalizedPublicPath = path.relative('public', KEY_FILE).split(path.sep).join('/');

  if (normalizedPublicPath.startsWith('..')) {
    throw new Error('INDEXNOW_KEY_FILE must be inside public/ unless INDEXNOW_KEY_LOCATION is set.');
  }

  return new URL(`/${normalizedPublicPath}`, site).toString();
}

function toBlogUrl(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  const match = normalized.match(/^src\/content\/blog\/([^/]+)\.mdx?$/);
  if (!match) return null;
  return new URL(`/blog/${match[1]}`, site).toString();
}

function urlsFromGitHubEvent() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) return [];

  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const files = new Set();

  for (const commit of event.commits ?? []) {
    for (const key of ['added', 'modified', 'removed']) {
      for (const file of commit[key] ?? []) {
        files.add(file);
      }
    }
  }

  for (const key of ['added', 'modified', 'removed']) {
    for (const file of event.head_commit?.[key] ?? []) {
      files.add(file);
    }
  }

  return [...files].map(toBlogUrl).filter(Boolean);
}

function urlsFromEnvironment() {
  return (process.env.INDEXNOW_URLS ?? '')
    .split(/[\n,]/)
    .map((url) => url.trim())
    .filter(Boolean);
}

function getSitemapFiles() {
  const sitemapIndexPath = path.join('dist', 'sitemap-index.xml');
  const files = new Set();

  if (fs.existsSync(sitemapIndexPath)) {
    const sitemapIndex = fs.readFileSync(sitemapIndexPath, 'utf8');
    for (const match of sitemapIndex.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const sitemapUrl = new URL(match[1]);
      const fileName = path.basename(sitemapUrl.pathname);
      if (/^sitemap-\d+\.xml$/.test(fileName)) files.add(path.join('dist', fileName));
    }
  }

  for (const fileName of fs.readdirSync('dist').filter((file) => /^sitemap-\d+\.xml$/.test(file))) {
    files.add(path.join('dist', fileName));
  }

  return [...files].filter((file) => fs.existsSync(file));
}

function urlsFromSitemap() {
  const escapedOrigin = site.origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const blogUrlPattern = new RegExp(`<loc>(${escapedOrigin}/blog/[^<]+)</loc>`, 'g');

  return getSitemapFiles().flatMap((sitemapPath) => {
    const sitemap = fs.readFileSync(sitemapPath, 'utf8');
    return [...sitemap.matchAll(blogUrlPattern)].map((match) => match[1]).filter((url) => !url.endsWith('/blog'));
  });
}

function normalizeUrls(urls) {
  const normalized = new Set();

  for (const rawUrl of urls) {
    const url = new URL(rawUrl, site);
    if (url.host !== site.host) {
      throw new Error(`IndexNow URL host mismatch: ${url.toString()} is not under ${site.host}`);
    }
    normalized.add(url.toString().replace(/\/$/, ''));
  }

  return [...normalized].slice(0, 10_000);
}

async function submit(urls, key, keyLocation) {
  const payload = {
    host: site.host,
    key,
    keyLocation,
    urlList: urls,
  };

  console.log(`IndexNow: submitting ${urls.length} URL(s) to ${ENDPOINT}`);
  for (const url of urls) console.log(`IndexNow URL: ${url}`);

  if (DRY_RUN) {
    console.log(
      JSON.stringify(
        {
          ...payload,
          key: '<redacted>',
        },
        null,
        2,
      ),
    );
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const body = await response.text();
    console.log(`IndexNow response: ${response.status} ${response.statusText}`);
    if (body.trim()) console.log(`IndexNow response body: ${body.trim()}`);

    if (![200, 202].includes(response.status)) {
      throw new Error(`IndexNow submission was not accepted: HTTP ${response.status}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const key = readIndexNowKey();
  const keyLocation = getKeyLocation();
  const urls = normalizeUrls([
    ...EXPLICIT_URLS,
    ...urlsFromEnvironment(),
    ...urlsFromGitHubEvent(),
    ...(ALL_BLOG ? urlsFromSitemap() : []),
  ]);

  if (urls.length === 0) {
    console.log('IndexNow: no changed blog URLs detected. Nothing to submit.');
    return;
  }

  try {
    await submit(urls, key, keyLocation);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (SOFT_FAIL) {
      console.warn(`IndexNow soft-fail: ${message}`);
      return;
    }
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
