import fs from 'node:fs';
import path from 'node:path';

const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'blog');
const OUTPUT_PATH = path.join(process.cwd(), 'reports', 'blog-performance-report.md');

function getFrontmatter(content) {
  return content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
}

function getScalar(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  if (!match) return '';
  return match[1].trim().replace(/^['"]|['"]$/g, '');
}

function getList(frontmatter, key) {
  const inlineMatch = frontmatter.match(new RegExp(`^${key}:\\s*\\[(.*)\\]$`, 'm'));
  if (inlineMatch) {
    return inlineMatch[1]
      .split(',')
      .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }

  const blockMatch = frontmatter.match(new RegExp(`^${key}:\\s*\\r?\\n((?:\\s+-\\s+.+\\r?\\n?)+)`, 'm'));
  if (!blockMatch) return [];
  return blockMatch[1]
    .split(/\r?\n/)
    .map((line) =>
      line
        .trim()
        .replace(/^-\s+/, '')
        .replace(/^['"]|['"]$/g, ''),
    )
    .filter(Boolean);
}

function getBlogFiles(dir = BLOG_DIR) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return getBlogFiles(fullPath);
      if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) return [fullPath];
      return [];
    })
    .sort();
}

function getPosts() {
  return getBlogFiles()
    .map((filePath) => {
      const relativePath = path.relative(BLOG_DIR, filePath);
      const slug = relativePath.slice(0, -path.extname(relativePath).length).split(path.sep).join('/');
      const content = fs.readFileSync(filePath, 'utf8');
      const frontmatter = getFrontmatter(content);

      return {
        slug,
        title: getScalar(frontmatter, 'title'),
        date: getScalar(frontmatter, 'date'),
        updatedAt: getScalar(frontmatter, 'updatedAt'),
        category: getScalar(frontmatter, 'category'),
        tags: getList(frontmatter, 'tags'),
      };
    })
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return a.slug.localeCompare(b.slug);
    });
}

function buildReport(posts) {
  const contentSnapshot = posts
    .map((post) => post.updatedAt || post.date)
    .filter(Boolean)
    .sort()
    .at(-1);
  const rows = posts
    .map((post) =>
      [
        `[/blog/${post.slug}](https://helmforge.dev/blog/${post.slug})`,
        post.title.replaceAll('|', '\\|'),
        post.category,
        post.date,
        post.updatedAt || '-',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ].join(' | '),
    )
    .join('\n');

  return `# HelmForge Blog Performance Report

Content snapshot: ${contentSnapshot ?? 'no-posts'}

Use this report as the recurring Phase 7 review artifact after Search Console, Bing Webmaster Tools, and analytics have enough data. Fill the empty metric columns during weekly and monthly reviews.

<!-- prettier-ignore-start -->

## Console Status

| Area | Status | Notes |
| --- | --- | --- |
| Google Search Console property | Pending manual verification | Verify https://helmforge.dev/ and submit https://helmforge.dev/sitemap-index.xml. |
| Bing Webmaster Tools property | Pending manual verification | Verify or import from Google Search Console, then submit the sitemap index. |
| IndexNow | Configured | Review deploy logs and Bing IndexNow insights after publication. |
| RSS discovery | Configured | Confirm /blog/rss.xml freshness after each blog deploy. |
| Core Web Vitals | Instrumented | Review Search Console CWV and GA4 Web Vitals events. |

## Source Segments

- Google Search
- Google Discover
- Google News surfaces
- Bing
- Microsoft Start
- Social shares
- RSS
- Direct and referrals

## Per-Post Metrics

| URL | Title | Category | Published | Updated | Google clicks | Impressions | CTR | Avg position | Discover clicks | Bing clicks | CWV notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows}

<!-- prettier-ignore-end -->

## Monthly Review Notes

- Top query wins:
- Posts with declining CTR:
- Posts with indexing issues:
- Posts with image indexing issues:
- Core Web Vitals actions:
- Next editorial opportunities:
`;
}

function main() {
  const checkOnly = process.argv.includes('--check');
  const posts = getPosts();
  const report = buildReport(posts);

  if (checkOnly) {
    const current = fs.existsSync(OUTPUT_PATH) ? fs.readFileSync(OUTPUT_PATH, 'utf8') : '';
    if (current !== report) {
      console.error(
        `${path.relative(process.cwd(), OUTPUT_PATH)} is out of date. Run npm run blog:performance-report.`,
      );
      process.exit(1);
    }
    console.log(`${path.relative(process.cwd(), OUTPUT_PATH)} is current.`);
    return;
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, report);
  console.log(`Wrote ${path.relative(process.cwd(), OUTPUT_PATH)} for ${posts.length} post(s).`);
}

main();
