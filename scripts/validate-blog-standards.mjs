import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');
const PUBLIC_DIR = path.join(ROOT, 'public');
const AUTHORS_FILE = path.join(ROOT, 'src', 'data', 'authors.ts');

const OFFICIAL_REFERENCE_HOSTS = new Set([
  'kubernetes.io',
  'k8s.io',
  'github.com',
  'cri-o.io',
  'helm.sh',
  'opencontainers.org',
  'docker.com',
  'docs.docker.com',
  'postgresql.org',
  'mysql.com',
  'mariadb.org',
  'redis.io',
  'mongodb.com',
  'rabbitmq.com',
  'prometheus.io',
  'grafana.com',
  'cncf.io',
]);

const NON_OFFICIAL_BANNED_HOSTS = new Set(['replicated.com', 'knowledge.broadcom.com', 'medium.com']);

function extractFrontmatter(content, filePath) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    throw new Error(`Missing frontmatter in ${filePath}`);
  }
  return { frontmatter: match[1], body: content.slice(match[0].length) };
}

function getFrontmatterScalar(frontmatter, key) {
  const regex = new RegExp(`^${key}:\\s*(.+)$`, 'm');
  const match = frontmatter.match(regex);
  if (!match) {
    return undefined;
  }
  return match[1].trim().replace(/^['"]|['"]$/g, '');
}

function getFrontmatterTags(frontmatter) {
  const match = frontmatter.match(/^tags:\s*\[(.*)\]\s*$/m);
  if (!match) {
    return [];
  }
  return match[1]
    .split(',')
    .map((t) => t.trim().replace(/^['"]|['"]$/g, '').toLowerCase())
    .filter(Boolean);
}

function getAllowedAuthorIds() {
  const authorsContent = fs.readFileSync(AUTHORS_FILE, 'utf8');
  return new Set([...authorsContent.matchAll(/'([^']+)':\s*{/g)].map((m) => m[1]));
}

function getWebpDimensions(buffer) {
  if (buffer.length < 30 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('Not a valid WEBP file');
  }

  const chunkType = buffer.toString('ascii', 12, 16);

  if (chunkType === 'VP8X') {
    const width = 1 + buffer.readUIntLE(24, 3);
    const height = 1 + buffer.readUIntLE(27, 3);
    return { width, height };
  }

  if (chunkType === 'VP8L') {
    const packed = buffer.readUInt32LE(21);
    const width = (packed & 0x3fff) + 1;
    const height = ((packed >> 14) & 0x3fff) + 1;
    return { width, height };
  }

  if (chunkType === 'VP8 ') {
    const width = buffer.readUInt16LE(26) & 0x3fff;
    const height = buffer.readUInt16LE(28) & 0x3fff;
    return { width, height };
  }

  throw new Error(`Unsupported WEBP chunk type: ${chunkType}`);
}

function hostIsAllowed(hostname) {
  const normalizedHost = hostname.toLowerCase();
  for (const allowed of OFFICIAL_REFERENCE_HOSTS) {
    if (normalizedHost === allowed || normalizedHost.endsWith(`.${allowed}`)) {
      return true;
    }
  }
  return false;
}

function hostIsBanned(hostname) {
  const normalizedHost = hostname.toLowerCase();
  for (const banned of NON_OFFICIAL_BANNED_HOSTS) {
    if (normalizedHost === banned || normalizedHost.endsWith(`.${banned}`)) {
      return true;
    }
  }
  return false;
}

function validateReferencesSection(body, filePath, errors) {
  const referencesHeading = /^##\s+References\s*$/im;
  const headingMatch = referencesHeading.exec(body);
  if (!headingMatch) {
    return;
  }

  const start = headingMatch.index + headingMatch[0].length;
  const remaining = body.slice(start);
  const nextHeading = remaining.search(/\r?\n##\s+/);
  const section = nextHeading === -1 ? remaining : remaining.slice(0, nextHeading);

  const urls = [...section.matchAll(/\[[^\]]+\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]);
  for (const rawUrl of urls) {
    try {
      const hostname = new URL(rawUrl).hostname;
      if (hostIsBanned(hostname)) {
        errors.push(`${filePath}: reference host "${hostname}" is non-official and blocked by policy`);
      } else if (!hostIsAllowed(hostname)) {
        errors.push(`${filePath}: reference host "${hostname}" is not in official allowlist`);
      }
    } catch {
      errors.push(`${filePath}: invalid reference URL "${rawUrl}"`);
    }
  }
}

function validateCoverImage(frontmatter, filePath, errors) {
  const coverImage = getFrontmatterScalar(frontmatter, 'coverImage');
  const coverAlt = getFrontmatterScalar(frontmatter, 'coverAlt');

  if (!coverImage) {
    return;
  }

  if (!coverImage.startsWith('/blog/')) {
    errors.push(`${filePath}: coverImage must be under /blog/`);
  }
  if (!coverImage.endsWith('-hero.webp')) {
    errors.push(`${filePath}: coverImage must end with -hero.webp`);
  }
  if (!coverAlt || coverAlt.length < 12) {
    errors.push(`${filePath}: coverAlt is required and must be descriptive`);
  }

  const imagePath = path.join(PUBLIC_DIR, coverImage.replace(/^\//, ''));
  if (!fs.existsSync(imagePath)) {
    errors.push(`${filePath}: coverImage file not found: ${coverImage}`);
    return;
  }

  try {
    const dimensions = getWebpDimensions(fs.readFileSync(imagePath));
    const ratio = dimensions.width / dimensions.height;
    const expected = 16 / 9;
    const delta = Math.abs(ratio - expected);
    if (delta > 0.03) {
      errors.push(
        `${filePath}: coverImage must be near 16:9. Current ${dimensions.width}x${dimensions.height} (${ratio.toFixed(3)})`,
      );
    }
  } catch (error) {
    errors.push(`${filePath}: failed to read WEBP metadata (${error instanceof Error ? error.message : error})`);
  }
}

function validateAuthorId(frontmatter, filePath, allowedAuthorIds, errors) {
  const authorId = getFrontmatterScalar(frontmatter, 'authorId');
  if (!authorId) {
    errors.push(`${filePath}: authorId is required`);
    return;
  }
  if (!allowedAuthorIds.has(authorId)) {
    errors.push(`${filePath}: authorId "${authorId}" is not defined in src/data/authors.ts`);
  }
  if (/team/i.test(authorId)) {
    errors.push(`${filePath}: authorId cannot be a team/generic identity`);
  }
}

function validateTechnicalVisual(tags, body, filePath, errors) {
  const requiresVisual = tags.includes('tutorial') || tags.includes('operations') || tags.includes('incident');
  if (!requiresVisual) {
    return;
  }

  const hasImage = /!\[[^\]]*\]\([^)]+\)/.test(body);
  const hasDiagramComponent = /<ArchitectureDiagram\b|<PostgresqlDiagram\b|<MysqlDiagram\b|<RedisDiagram\b|<KeycloakDiagram\b/.test(
    body,
  );

  if (!hasImage && !hasDiagramComponent) {
    errors.push(`${filePath}: technical tutorial/incident post must include at least one explanatory image or diagram`);
  }
}

function main() {
  const allowedAuthorIds = getAllowedAuthorIds();
  const files = fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith('.md') || file.endsWith('.mdx'));
  const errors = [];

  for (const fileName of files) {
    const fullPath = path.join(BLOG_DIR, fileName);
    const content = fs.readFileSync(fullPath, 'utf8');
    const { frontmatter, body } = extractFrontmatter(content, fullPath);
    const tags = getFrontmatterTags(frontmatter);

    validateAuthorId(frontmatter, fullPath, allowedAuthorIds, errors);
    validateCoverImage(frontmatter, fullPath, errors);
    validateTechnicalVisual(tags, body, fullPath, errors);
    validateReferencesSection(body, fullPath, errors);
  }

  if (errors.length > 0) {
    console.error('Blog standards validation failed:\n');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`Blog standards validation passed for ${files.length} post(s).`);
}

main();
