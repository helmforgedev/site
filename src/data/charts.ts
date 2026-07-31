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
    description: 'MySQL with standalone/source-replica, TLS, External Secrets, dual-stack Services, and S3 backup.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'PostgreSQL',
    slug: 'postgresql',
    description: 'PostgreSQL with streaming replication, TLS, structured pg_hba, External Secrets, and backups.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Redis',
    slug: 'redis',
    description: 'Redis standalone, replication, Sentinel, and cluster modes with TLS, dual-stack Services, and ESO.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Memcached',
    slug: 'memcached',
    description: 'Distributed memory cache with TLS, SASL/ASCII auth, extstore, metrics, dual-stack Services, and ESO.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'MongoDB',
    slug: 'mongodb',
    description: 'MongoDB with standalone, replica set, sharded cluster, External Secrets, metrics, and S3 backup.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'ClickHouse',
    slug: 'clickhouse',
    description:
      'Standalone ClickHouse OLAP database with official images, persistent storage, metrics, ESO, and safety guards.',
    maturity: 'beta',
    backup: false,
  },
  {
    name: 'RabbitMQ',
    slug: 'rabbitmq',
    description:
      'RabbitMQ with single-node or cluster mode, quorum queues, low idle CPU defaults, Gateway API, and External Secrets.',
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
    description:
      'WordPress CMS with MySQL, WP-CLI bootstrap, Gateway API, External Secrets, object cache, and S3 backup.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Matomo',
    slug: 'matomo',
    description: 'Privacy-first analytics with official Matomo image, MySQL, archiver CronJob, Gateway API, and ESO.',
    maturity: 'beta',
    backup: false,
  },
  {
    name: 'NetBox',
    slug: 'netbox',
    description:
      'Infrastructure source of truth for DCIM and IPAM with separate web, RQ worker, housekeeping, PostgreSQL, Redis, Gateway API, and ESO.',
    maturity: 'beta',
    backup: false,
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
    name: 'Certimate',
    slug: 'certimate',
    description: 'Self-hosted certificate automation for ACME issuance, renewal, deployment, and monitoring.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'NetBird',
    slug: 'netbird',
    description: 'Self-hosted WireGuard overlay control plane with dashboard, API, gRPC, signal, relay, and STUN.',
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
    description:
      'Self-hosted monitoring with SQLite or MariaDB, Gateway API, External Secrets, S3 backup, and status pages.',
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
    description: 'Eclipse Mosquitto MQTT broker with TLS/mTLS, ACLs, bridge federation, WebSocket, and MQTTX Web.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Discount Bandit',
    slug: 'discount-bandit',
    description: 'Self-hosted price tracker with MySQL, Gateway API, External Secrets, and SQLite dev mode.',
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
    name: 'Langflow',
    slug: 'langflow',
    description: 'Visual AI workflow builder with persistent state, external database, and scaling guards.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'phpMyAdmin',
    slug: 'phpmyadmin',
    description: 'MySQL and MariaDB administration with Gateway API, External Secrets, and NetworkPolicy controls.',
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
    name: 'Gophish',
    slug: 'gophish',
    description: 'Phishing awareness platform with separated admin and campaign traffic.',
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
    description: 'Privacy analytics with PostgreSQL, Gateway API, External Secrets, dual-stack Services, and backup.',
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
    name: 'Statistics for Strava',
    slug: 'strava-statistics',
    description:
      'Self-hosted fitness dashboard with SQLite, Strava OAuth, Gateway API, External Secrets, and dual-stack Services.',
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
    name: 'BookLore',
    slug: 'booklore',
    description: 'Self-hosted eBook library manager with MariaDB, OPDS, and metadata fetching.',
    maturity: 'stable',
    backup: false,
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
    name: 'Qdrant',
    slug: 'qdrant',
    description: 'Vector database with persistent storage, auth, snapshots, metrics, and guarded clustering.',
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
    description:
      'Browser-based command panel with ConfigMap actions, metrics, Gateway API, External Secrets, and dual-stack Services.',
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
    name: 'Memos',
    slug: 'memos',
    description: 'Self-hosted notes with SQLite, external database support, backups, and secure defaults.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'NoteDiscovery',
    slug: 'notediscovery',
    description: 'Self-hosted Markdown knowledge base with graph view, search, sharing, and MCP integration.',
    maturity: 'beta',
    backup: false,
  },
  {
    name: 'MediKeep',
    slug: 'medikeep',
    description:
      'Self-hosted personal medical records manager with PostgreSQL, uploads, backups, and privacy controls.',
    maturity: 'beta',
    backup: false,
  },
  {
    name: 'Poznote',
    slug: 'poznote',
    description:
      'Self-hosted note-taking and documentation platform with SQLite persistence, OIDC authentication, and Markdown support.',
    maturity: 'beta',
    backup: false,
  },
  {
    name: 'GitHub MCP Server',
    slug: 'github-mcp-server',
    description: 'GitHub MCP server with streamable HTTP transport, toolset controls, and token secret support.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Kubernetes MCP Server',
    slug: 'kubernetes-mcp-server',
    description: 'Kubernetes MCP server with in-cluster RBAC, read-only defaults, and HTTP/SSE transport.',
    maturity: 'stable',
    backup: false,
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
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Elasticsearch',
    slug: 'elasticsearch',
    description: 'Multi-role cluster with automated backups, ILM policies, data tiers, and security by default.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'openHAB',
    slug: 'openhab',
    description: 'Home automation platform with GitOps-friendly live configuration reload via ConfigMaps.',
    maturity: 'stable',
    backup: true,
  },
  {
    name: 'Hoppscotch',
    slug: 'hoppscotch',
    description: 'Open-source API development platform with REST, GraphQL, and WebSocket support.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Apache',
    slug: 'apache',
    description:
      'Apache HTTP Server with custom content, non-root defaults, Gateway API, metrics, and dual-stack Services.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Immich',
    slug: 'immich',
    description: 'Photo and video management with HelmForge PostgreSQL, Redis-compatible cache, and machine learning.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Jenkins',
    slug: 'jenkins',
    description:
      'CI/CD automation with JCasC, plugin bootstrap, Kubernetes agent RBAC, Gateway API, and persistent home.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'JupyterHub',
    slug: 'jupyterhub',
    description: 'Multi-user notebook platform with KubeSpawner, configurable-http-proxy, user PVCs, and secure RBAC.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Kibana',
    slug: 'kibana',
    description:
      'Elastic Stack UI with secure Elasticsearch connectivity, optional HelmForge Elasticsearch, and Wolfi images.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Metrics Server',
    slug: 'metrics-server',
    description:
      'Kubernetes Metrics API server with secure RBAC, HA controls, k3d-friendly validation, and ServiceMonitor.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'OAuth2 Proxy',
    slug: 'oauth2-proxy',
    description:
      'OAuth2 and OIDC reverse proxy with hardened header trust, External Secrets, metrics, and Gateway API.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'OpenCut',
    slug: 'opencut',
    description:
      'Open-source video editor with HelmForge PostgreSQL and Redis dependencies plus Redis-over-HTTP bridge.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'OpenReel Video',
    slug: 'openreel-video',
    description:
      'Browser-based video editor with WebCodecs-ready static hosting, Gateway API, and hardened runtime defaults.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'SonarQube',
    slug: 'sonarqube',
    description: 'SonarQube Community Build with HelmForge PostgreSQL, plugin automation, and branch plugin wiring.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Tomcat',
    slug: 'tomcat',
    description:
      'Apache Tomcat with official image, default health webapp, writable runtime volumes, Gateway API, and JMX.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'Valkey',
    slug: 'valkey',
    description:
      'Valkey standalone, replication, Sentinel, and cluster topologies with TLS, metrics, dual-stack, and ESO.',
    maturity: 'stable',
    backup: false,
  },
  {
    name: 'ZooKeeper',
    slug: 'zookeeper',
    description:
      'Apache ZooKeeper replicated ensembles with quorum validation, SASL/TLS, metrics, PDB, and dual-stack.',
    maturity: 'stable',
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
