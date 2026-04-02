export interface Chart {
  name: string;
  slug: string;
  description: string;
  maturity: 'stable' | 'beta' | 'alpha';
  backup: boolean;
}

/** SVG icons use .svg extension, everything else .png */
const svgIcons = new Set([
  'generic',
  'pihole',
  'cloudflared',
  'velero',
  'kafka',
  'countly',
  'middleware',
  'superset',
  'ckan',
  'druid',
]);

export function chartIcon(slug: string): string {
  const ext = svgIcons.has(slug) ? 'svg' : 'png';
  return `/icons/charts/${slug}.${ext}`;
}

export const charts: Chart[] = [
  {
    name: 'Generic',
    slug: 'generic',
    description: 'Multi-purpose chart for Deployments, StatefulSets, Jobs, and CronJobs.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'MySQL',
    slug: 'mysql',
    description: 'MySQL with standalone and source-replica replication architectures.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'PostgreSQL',
    slug: 'postgresql',
    description: 'PostgreSQL with standalone and streaming replication support.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Redis',
    slug: 'redis',
    description: 'Redis with standalone and Sentinel high-availability modes.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'MongoDB',
    slug: 'mongodb',
    description: 'MongoDB with standalone and replica set configurations.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'RabbitMQ',
    slug: 'rabbitmq',
    description: 'RabbitMQ with management UI and clustering support.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Keycloak',
    slug: 'keycloak',
    description: 'Identity and access management for SSO and federation.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Vaultwarden',
    slug: 'vaultwarden',
    description: 'Bitwarden-compatible password manager with self-hosted simplicity.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Minecraft',
    slug: 'minecraft',
    description: 'Minecraft Java Edition server with backup, monitoring, and mod support.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Pi-hole',
    slug: 'pihole',
    description: 'Network-wide ad blocking with DNS sinkhole and optional recursive DNS.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'WordPress',
    slug: 'wordpress',
    description: 'WordPress CMS with MySQL, S3 backup, and production-friendly defaults.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Strapi',
    slug: 'strapi',
    description: 'Headless CMS with SQLite, PostgreSQL, MySQL, and persistent uploads.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Answer',
    slug: 'answer',
    description: 'Apache Answer Q&A platform with SQL backends and S3 backup.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'n8n',
    slug: 'n8n',
    description: 'Workflow automation with queue mode, SQL backends, and backup support.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Komga',
    slug: 'komga',
    description: 'Comics and manga server with OPDS, web reader, and S3 backup.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Guacamole',
    slug: 'guacamole',
    description: 'Remote desktop gateway with RDP, VNC, SSH, and SSO integration.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Cloudflared',
    slug: 'cloudflared',
    description: 'Cloudflare Tunnel with outbound-only networking and HA options.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'DDNS Updater',
    slug: 'ddns-updater',
    description: 'Dynamic DNS updater with web UI and provider coverage.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Uptime Kuma',
    slug: 'uptime-kuma',
    description: 'Self-hosted monitoring with status pages and broad notification support.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Appwrite',
    slug: 'appwrite',
    description: 'Self-hosted BaaS platform with MariaDB, Redis, and microservices.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Authelia',
    slug: 'authelia',
    description: 'SSO, MFA, and OpenID Connect for reverse proxies and apps.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'AdGuard Home',
    slug: 'adguard-home',
    description: 'DNS ad and tracker blocking with sync and backup features.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Velero',
    slug: 'velero',
    description: 'Kubernetes backup, restore, and migration with object storage.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Kafka',
    slug: 'kafka',
    description: 'KRaft single-broker and cluster modes with persistent storage.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Dolibarr',
    slug: 'dolibarr',
    description: 'ERP and CRM with MySQL, auto-installation, and persistent documents.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Mosquitto',
    slug: 'mosquitto',
    description: 'MQTT broker with standalone or federated topology and WebSocket support.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Docmost',
    slug: 'docmost',
    description: 'Collaborative wiki with bundled PostgreSQL, Redis, and local or S3 storage.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Flowise',
    slug: 'flowise',
    description: 'Visual AI orchestration with standalone or scalable queue architecture.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'phpMyAdmin',
    slug: 'phpmyadmin',
    description: 'Web-based MySQL and MariaDB administration with multi-server support.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Heimdall',
    slug: 'heimdall',
    description: 'Application dashboard for organizing self-hosted services.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Gitea',
    slug: 'gitea',
    description: 'Self-hosted Git service with SQL backends, SSH access, and S3 backup.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Homarr',
    slug: 'homarr',
    description: 'Modern dashboard with SQL options, integrations, and S3 backup.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'MariaDB',
    slug: 'mariadb',
    description: 'MariaDB with standalone and GTID-based replication plus backup support.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'ArchiveBox',
    slug: 'archivebox',
    description: 'Self-hosted web archiving with Chromium headless and multi-format capture.',
    maturity: 'alpha',
    backup: false,
  },
  {
    name: 'Countly',
    slug: 'countly',
    description: 'Product analytics with event tracking, crash reporting, and MongoDB backend.',
    maturity: 'alpha',
    backup: false,
  },
  {
    name: 'Middleware',
    slug: 'middleware',
    description: 'DORA metrics platform with PostgreSQL, Redis, and engineering performance tracking.',
    maturity: 'alpha',
    backup: false,
  },
  {
    name: 'Apache Superset',
    slug: 'superset',
    description: 'Data exploration and visualization with Celery workers, PostgreSQL, and Redis.',
    maturity: 'alpha',
    backup: false,
  },
  {
    name: 'CKAN',
    slug: 'ckan',
    description: 'Open data portal with DataPusher, Solr, PostgreSQL, and Redis.',
    maturity: 'alpha',
    backup: false,
  },
  {
    name: 'Apache Druid',
    slug: 'druid',
    description: 'Distributed analytics database with coordinator, broker, historical, and router.',
    maturity: 'alpha',
    backup: false,
  },
];

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
