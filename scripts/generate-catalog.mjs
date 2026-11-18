// SPDX-License-Identifier: Apache-2.0
/**
 * Automated Catalog Generator for HelmForge.
 *
 * Scans all charts from the charts repository, extracts metadata from
 * Chart.yaml and values.yaml, and generates a structured catalog.json
 * as well as an updated charts.ts with full backward compatibility.
 *
 * Usage: node scripts/generate-catalog.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { load } from 'js-yaml';

const SITE_ROOT = process.cwd();
const CHARTS_CANDIDATES = [
  path.resolve(SITE_ROOT, '../charts/charts'),
  path.resolve(SITE_ROOT, '.charts-repo/charts'),
  process.env.HELMFORGE_CHARTS_ROOT,
].filter(Boolean);

let chartsDir = null;
for (const cand of CHARTS_CANDIDATES) {
  if (cand && fs.existsSync(cand)) {
    chartsDir = cand;
    break;
  }
}

if (!chartsDir) {
  console.error('Error: Could not locate charts repository. Tried:', CHARTS_CANDIDATES);
  process.exit(1);
}

console.log(`Scanning charts from: ${chartsDir}`);

// Curated display name overrides where title-casing differs
const DISPLAY_NAMES = {
  'adguard-home': 'AdGuard Home',
  'bentopdf': 'BentoPDF',
  'bytestash': 'ByteStash',
  'cloudflared': 'Cloudflared',
  'ddns-updater': 'DDNS Updater',
  'discount-bandit': 'Discount Bandit',
  'docmost': 'Docmost',
  'documenso': 'Documenso',
  'docuseal': 'DocuSeal',
  'fastmcp-server': 'FastMCP Server',
  'ghostfolio': 'Ghostfolio',
  'github-mcp-server': 'GitHub MCP Server',
  'ib-gateway': 'IB Gateway',
  'jupyterhub': 'JupyterHub',
  'karakeep': 'KaraKeep',
  'keycloak': 'Keycloak',
  'kubernetes-mcp-server': 'Kubernetes MCP Server',
  'langflow': 'Langflow',
  'listmonk': 'Listmonk',
  'medikeep': 'MediKeep',
  'n8n': 'n8n',
  'nautilus-trader': 'NautilusTrader',
  'netbird': 'NetBird',
  'netbox': 'NetBox',
  'nextcloud': 'Nextcloud',
  'notediscovery': 'NoteDiscovery',
  'oauth2-proxy': 'OAuth2 Proxy',
  'open-webui': 'Open WebUI',
  'opencut': 'OpenCut',
  'openhab': 'openHAB',
  'openhuman': 'OpenHuman',
  'openreel-video': 'OpenReel Video',
  'openreplay': 'OpenReplay',
  'opensign': 'OpenSign',
  'paperless-ngx': 'Paperless-ngx',
  'phpmyadmin': 'phpMyAdmin',
  'pihole': 'Pi-hole',
  'pimcore': 'Pimcore',
  'pocket-id': 'Pocket ID',
  'postgresql': 'PostgreSQL',
  'poznote': 'Poznote',
  'questdb': 'QuestDB',
  'rabbitmq': 'RabbitMQ',
  'reactive-resume': 'Reactive Resume',
  'rustdesk-server': 'RustDesk Server',
  'rustfs': 'RustFS',
  'stirling-pdf': 'Stirling-PDF',
  'strava-statistics': 'Strava Statistics',
  'text-embeddings-inference': 'Text Embeddings Inference',
  'uptime-kuma': 'Uptime Kuma',
  'vaultwarden': 'Vaultwarden',
  'webodm': 'WebODM',
  'wordpress': 'WordPress',
  'zookeeper': 'ZooKeeper',
};

function formatDisplayName(slug, rawName) {
  if (DISPLAY_NAMES[slug]) return DISPLAY_NAMES[slug];
  if (rawName && rawName !== slug) {
    // If name is already capitalized nicely
    if (/[A-Z]/.test(rawName)) return rawName;
  }
  // Title Case fallback
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const entries = fs
  .readdirSync(chartsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name));

const catalog = [];

for (const entry of entries) {
  const slug = entry.name;
  const chartYamlPath = path.join(chartsDir, slug, 'Chart.yaml');
  const valuesYamlPath = path.join(chartsDir, slug, 'values.yaml');
  const schemaPath = path.join(chartsDir, slug, 'values.schema.json');

  if (!fs.existsSync(chartYamlPath)) continue;

  try {
    const chartYaml = load(fs.readFileSync(chartYamlPath, 'utf8')) || {};
    const hasValues = fs.existsSync(valuesYamlPath);
    let valuesContent = '';
    let hasBackup = false;

    if (hasValues) {
      valuesContent = fs.readFileSync(valuesYamlPath, 'utf8');
      // Detect backup CronJob/S3 support in values
      hasBackup =
        /\nbackup:\s*\n/m.test(valuesContent) ||
        /\n\s+backup:\s*\n/m.test(valuesContent) ||
        /backup\.enabled/m.test(valuesContent) ||
        chartYaml.annotations?.['helmforge.dev/backup'] === 'true';
    }

    const maturity = chartYaml.annotations?.['helmforge.dev/maturity'] || 'stable';
    const category = chartYaml.annotations?.['artifacthub.io/category'] || 'general';
    const displayName = formatDisplayName(slug, chartYaml.annotations?.['artifacthub.io/alternativeName'] || chartYaml.name);

    catalog.push({
      name: displayName,
      slug,
      description: chartYaml.description || `${displayName} Helm chart for Kubernetes`,
      maturity,
      backup: Boolean(hasBackup),
      version: chartYaml.version || '1.0.0',
      appVersion: chartYaml.appVersion || 'latest',
      category,
      keywords: chartYaml.keywords || [slug],
      hasValuesSchema: fs.existsSync(schemaPath),
      icon: `/icons/charts/${slug}.png`,
    });
  } catch (err) {
    console.warn(`Warning: failed to parse chart ${slug}:`, err.message);
  }
}

// Ensure documented charts that are in PR/companion branches remain in catalog
const COMPANION_DOCUMENTED_CHARTS = [
  {
    name: 'Attic',
    slug: 'attic',
    description: 'Nix binary cache with standalone SQLite storage or distributed PostgreSQL and S3 operation.',
    maturity: 'beta',
    backup: true,
  },
  {
    name: 'Atuin',
    slug: 'atuin',
    description: 'Encrypted shell history sync with persistent SQLite or scalable PostgreSQL operation.',
    maturity: 'beta',
    backup: false,
  },
  {
    name: 'Bulwark Mail',
    slug: 'bulwark-mail',
    description: 'JMAP-native webmail for Stalwart with persistent or shared-store state, controlled bootstrap and multi-replica operation.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Discourse',
    slug: 'discourse',
    description: 'Experimental community forum with PostgreSQL, Redis, pgvector, and persistent shared data.',
    maturity: 'beta',
    backup: false,
  },
  {
    name: 'Documenso',
    slug: 'documenso',
    description: 'Electronic signatures with PostgreSQL, BullMQ, S3-compatible storage, immutable identity and hardened networking.',
    maturity: 'beta',
    backup: false,
  },
  {
    name: 'DocuSeal',
    slug: 'docuseal',
    description: 'Electronic signatures with PostgreSQL, Redis, durable attachments and production-safe scale-out.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Ghostfolio',
    slug: 'ghostfolio',
    description: 'Private wealth management with PostgreSQL, Redis, a pinned upstream release, OIDC and hardened networking.',
    maturity: 'beta',
    backup: false,
  },
  {
    name: 'IB Gateway',
    slug: 'ib-gateway',
    description: 'Interactive Brokers Gateway runtime with safe paper defaults, Secret-file credentials and private TCP access.',
    maturity: 'beta',
    backup: false,
  },
  {
    name: 'NautilusTrader',
    slug: 'nautilus-trader',
    description: 'Algorithmic trading runtime with immutable upstream image, singleton live nodes, backtests and secret integrations.',
    maturity: 'beta',
    backup: false,
  },
  {
    name: 'OpenHuman',
    slug: 'openhuman',
    description: 'Persistent AI agent Core with authenticated RPC, retained memory and hardened Kubernetes operation.',
    maturity: 'beta',
    backup: false,
  },
  {
    name: 'OpenReplay',
    slug: 'openreplay',
    description: 'Session replay stack with fifteen OSS services, managed migrations and portable Kubernetes exposure.',
    maturity: 'beta',
    backup: false,
  },
  {
    name: 'OpenSign',
    slug: 'opensign',
    description: 'Electronic signatures with separate web and API workloads, MongoDB, S3-compatible storage and retained identity.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Paperless-ngx',
    slug: 'paperless-ngx',
    description: 'Document management with OCR, bundled PostgreSQL and Valkey, persistent media volumes and optional Tika/Gotenberg.',
    maturity: 'alpha',
    backup: false,
  },
  {
    name: 'QuestDB',
    slug: 'questdb',
    description: 'Real-time time-series analytics with secure credentials, persistent storage and Prometheus metrics.',
    maturity: 'beta',
    backup: false,
  },
  {
    name: 'RustFS',
    slug: 'rustfs',
    description: 'S3-compatible object storage with standalone or distributed topology, durable volumes and replication setup.',
    maturity: 'alpha',
    backup: false,
  },
  {
    name: 'Stalwart',
    slug: 'stalwart',
    description: 'Mail and collaboration server with external-secret-native configuration, guarded HA and HTTP/TCP/TLS Gateway API routes.',
    maturity: 'beta',
    backup: false,
  },
  {
    name: 'Temporal',
    slug: 'temporal',
    description: 'Durable workflow orchestration with separate server roles, managed PostgreSQL schemas, and native HTTP and gRPC Gateway API routes.',
    maturity: 'beta',
    backup: false,
  },
  {
    name: 'Transmute',
    slug: 'transmute',
    description: 'Self-hosted file conversion with persistent SQLite storage, OIDC, External Secrets, and Gateway API support.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'WebODM',
    slug: 'webodm',
    description: 'Drone mapping with PostGIS, Redis, scalable Celery workers and CPU or NVIDIA GPU processing.',
    maturity: 'beta',
    backup: false,
  },
];

const existingSlugs = new Set(catalog.map((c) => c.slug));
for (const comp of COMPANION_DOCUMENTED_CHARTS) {
  if (!existingSlugs.has(comp.slug)) {
    catalog.push({
      ...comp,
      version: '1.0.0',
      appVersion: 'latest',
      category: 'general',
      keywords: [comp.slug],
      hasValuesSchema: false,
      icon: `/icons/charts/${comp.slug}.png`,
    });
    existingSlugs.add(comp.slug);
  }
}

console.log(`Successfully parsed and registered ${catalog.length} charts.`);

// Sort stable first, then alphabetically by name
catalog.sort((a, b) => {
  if (a.maturity === 'stable' && b.maturity !== 'stable') return -1;
  if (a.maturity !== 'stable' && b.maturity === 'stable') return 1;
  return a.name.localeCompare(b.name);
});

// 1. Write catalog.json
const catalogJsonPath = path.join(SITE_ROOT, 'src/data/catalog.json');
fs.writeFileSync(catalogJsonPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
console.log(`Wrote ${catalogJsonPath}`);

// 2. Write auto-generated charts.ts with full backward compatibility and automated SSOT
const chartsArrayStr = JSON.stringify(catalog, null, 2);

const chartsTsContent = `// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
// Generated from charts repository via scripts/generate-catalog.mjs

export interface Chart {
  name: string;
  slug: string;
  description: string;
  maturity: 'stable' | 'beta' | 'alpha';
  backup: boolean;
  version?: string;
  appVersion?: string;
  category?: string;
  keywords?: string[];
  hasValuesSchema?: boolean;
}

export const FALLBACK_ICON = '/icons/charts/kubernetes.png';

export function chartIcon(slug: string): string {
  return \`/icons/charts/\${slug}.png\`;
}

export const charts: Chart[] = ${chartsArrayStr};

export const chartCount = charts.length;
export const backupCount = charts.filter((c) => c.backup).length;
export const stableCount = charts.filter((c) => c.maturity === 'stable').length;

/** Deterministic color palette for chart icon badges */
const iconColors = [
  'bg-violet-500/15 text-violet-400',
  'bg-sky-500/15 text-sky-400',
  'bg-emerald-500/15 text-emerald-400',
  'bg-orange-500/15 text-orange-400',
  'bg-rose-500/15 text-rose-400',
  'bg-cyan-500/15 text-cyan-400',
  'bg-amber-500/15 text-amber-400',
  'bg-indigo-500/15 text-indigo-400',
  'bg-teal-500/15 text-teal-400',
  'bg-pink-500/15 text-pink-400',
  'bg-lime-500/15 text-lime-400',
  'bg-fuchsia-500/15 text-fuchsia-400',
] as const;

export function slugColor(slug: string): string {
  let hash = 0;
  for (const ch of slug) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
  return iconColors[Math.abs(hash) % iconColors.length];
}

export const maturityStyles = {
  stable: 'bg-green-500/10 text-green-400 border-green-500/20',
  beta: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  alpha: 'bg-red-500/10 text-red-400 border-red-500/20',
} as const;
`;

const chartsTsPath = path.join(SITE_ROOT, 'src/data/charts.ts');
fs.writeFileSync(chartsTsPath, chartsTsContent, 'utf8');
console.log(`Wrote ${chartsTsPath} automatically!`);
try {
  execSync('npx prettier --write src/data/catalog.json src/data/charts.ts', {
    cwd: SITE_ROOT,
    stdio: 'ignore',
  });
} catch {
  // Prettier optional if devDependencies not present
}
