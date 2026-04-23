export interface Chart {
  name: string;
  slug: string;
  description: string;
  maturity: 'stable' | 'beta' | 'alpha';
  backup: boolean;
}

export const FALLBACK_ICON = '/icons/charts/kubernetes.png';

export function chartIcon(slug: string): string {
  return `/icons/charts/${slug}.png`;
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
    name: 'Karakeep',
    slug: 'karakeep',
    description: 'AI-powered bookmark manager with Meilisearch and Chromium sidecars.',
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
    name: 'Drupal',
    slug: 'drupal',
    description:
      'Production-ready Drupal CMS with seeded sites persistence, MySQL or SQLite backups, and safe autoscaling guardrails.',
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
    backup: true,
  },
  {
    name: 'Automatisch',
    slug: 'automatisch',
    description: 'Open-source workflow automation platform with PostgreSQL and Redis.',
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
    name: 'alf.io',
    slug: 'alfio',
    description: 'Open-source event management and ticketing with PostgreSQL.',
    maturity: 'stable',
    backup: false,
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
    backup: true,
  },
  {
    name: 'Mosquitto',
    slug: 'mosquitto',
    description: 'MQTT broker with standalone or federated topology and WebSocket support.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Discount Bandit',
    slug: 'discount-bandit',
    description: 'Self-hosted price tracker and deal aggregator with SQLite persistence.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Docmost',
    slug: 'docmost',
    description: 'Collaborative wiki with bundled PostgreSQL, Redis, and local or S3 storage.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Flowise',
    slug: 'flowise',
    description: 'Visual AI orchestration with standalone or scalable queue architecture.',
    maturity: 'stable',
    backup: true,
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
    name: 'Ghost',
    slug: 'ghost',
    description: 'Modern publishing platform with MySQL backend and S3 content backup.',
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
    name: 'Umami',
    slug: 'umami',
    description: 'Privacy-focused web analytics with PostgreSQL and auto-generated app secret.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Metabase',
    slug: 'metabase',
    description: 'Open-source business intelligence and analytics with PostgreSQL and JVM tuning.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Listmonk',
    slug: 'listmonk',
    description: 'Self-hosted newsletter and mailing list manager with PostgreSQL and S3 backup.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Liwan',
    slug: 'liwan',
    description: 'Ultra-lightweight privacy-first web analytics with embedded DuckDB.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Wallabag',
    slug: 'wallabag',
    description: 'Self-hosted read-it-later with PostgreSQL, optional Redis, and Symfony config.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Strava Statistics',
    slug: 'strava-statistics',
    description: 'Self-hosted fitness dashboard with SQLite and Strava OAuth integration.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'ArchiveBox',
    slug: 'archivebox',
    description: 'Self-hosted web archiving with Chromium headless and multi-format capture.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Cronicle',
    slug: 'cronicle',
    description: 'Multi-server task scheduler with web UI and persistent job storage.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Countly',
    slug: 'countly',
    description: 'Product analytics with event tracking, crash reporting, and MongoDB backend.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Middleware',
    slug: 'middleware',
    description: 'DORA metrics platform with PostgreSQL, Redis, and engineering performance tracking.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Apache Superset',
    slug: 'superset',
    description: 'Data exploration and visualization with Celery workers, PostgreSQL, and Redis.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Castopod',
    slug: 'castopod',
    description: 'Open-source podcast hosting with MariaDB and optional Redis cache.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'changedetection.io',
    slug: 'changedetection',
    description: 'Website change monitoring with optional headless browser sidecar.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'ChiefOnboarding',
    slug: 'chiefonboarding',
    description: 'Employee onboarding platform with PostgreSQL backend.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'CKAN',
    slug: 'ckan',
    description: 'Open data portal with DataPusher, Solr, PostgreSQL, and Redis.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Apache Druid',
    slug: 'druid',
    description: 'Distributed analytics database with coordinator, broker, historical, and router.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'ntfy',
    slug: 'ntfy',
    description: 'Self-hosted push notification server with Prometheus metrics and REST API.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'OliveTin',
    slug: 'olivetin',
    description: 'Browser-based UI for predefined shell commands and system actions.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Open WebUI',
    slug: 'open-webui',
    description: 'Self-hosted AI chat platform with Ollama/OpenAI, RAG, PostgreSQL, and Redis.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'FastMCP Server',
    slug: 'fastmcp-server',
    description: 'MCP server with multi-source tool, resource, prompt, and knowledge loading.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Envoy Gateway',
    slug: 'envoy-gateway',
    description: 'Modern Gateway API implementation with rate limiting, cert-manager, and observability.',
    maturity: 'beta',
    backup: false,
  },
  {
    name: 'Elasticsearch',
    slug: 'elasticsearch',
    description: 'Multi-role cluster with automated backups, ILM policies, data tiers, and security by default.',
    maturity: 'alpha',
    backup: true,
  },
  {
    name: 'openHAB',
    slug: 'openhab',
    description: 'Home automation platform with GitOps-friendly live configuration reload via ConfigMaps.',
    maturity: 'beta',
    backup: true,
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
