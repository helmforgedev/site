export interface NavItem {
  label: string;
  href: string;
}

export interface ChartNavItem extends NavItem {
  maturity: 'stable' | 'beta' | 'alpha';
}

export const sidebarNav: NavItem[] = [
  { label: 'Getting Started', href: '/docs/getting-started' },
  { label: 'Charts Overview', href: '/docs/charts' },
  { label: 'Stack Examples', href: '/docs/stack-examples' },
  { label: 'HelmForge vs Other Charts', href: '/docs/comparison' },
  { label: 'FAQ', href: '/docs/faq' },
  { label: 'Troubleshooting', href: '/docs/troubleshooting' },
];

export interface ChartCategory {
  label: string;
  charts: ChartNavItem[];
}

export const chartCategories: ChartCategory[] = [
  {
    label: 'Databases',
    charts: [
      { label: 'MySQL', href: '/docs/charts/mysql', maturity: 'stable' },
      { label: 'PostgreSQL', href: '/docs/charts/postgresql', maturity: 'stable' },
      { label: 'MongoDB', href: '/docs/charts/mongodb', maturity: 'stable' },
      { label: 'MariaDB', href: '/docs/charts/mariadb', maturity: 'stable' },
      { label: 'Redis', href: '/docs/charts/redis', maturity: 'stable' },
    ],
  },
  {
    label: 'Messaging & Streaming',
    charts: [
      { label: 'RabbitMQ', href: '/docs/charts/rabbitmq', maturity: 'stable' },
      { label: 'Kafka', href: '/docs/charts/kafka', maturity: 'stable' },
      { label: 'Mosquitto', href: '/docs/charts/mosquitto', maturity: 'stable' },
      { label: 'ntfy', href: '/docs/charts/ntfy', maturity: 'stable' },
    ],
  },
  {
    label: 'CMS & Content',
    charts: [
      { label: 'WordPress', href: '/docs/charts/wordpress', maturity: 'stable' },
      { label: 'Strapi', href: '/docs/charts/strapi', maturity: 'stable' },
      { label: 'Docmost', href: '/docs/charts/docmost', maturity: 'stable' },
      { label: 'Ghost', href: '/docs/charts/ghost', maturity: 'stable' },
      { label: 'Komga', href: '/docs/charts/komga', maturity: 'stable' },
      { label: 'Castopod', href: '/docs/charts/castopod', maturity: 'stable' },
      { label: 'Listmonk', href: '/docs/charts/listmonk', maturity: 'stable' },
    ],
  },
  {
    label: 'Identity & Security',
    charts: [
      { label: 'Keycloak', href: '/docs/charts/keycloak', maturity: 'stable' },
      { label: 'Vaultwarden', href: '/docs/charts/vaultwarden', maturity: 'stable' },
      { label: 'Authelia', href: '/docs/charts/authelia', maturity: 'stable' },
    ],
  },
  {
    label: 'Networking & DNS',
    charts: [
      { label: 'Cloudflared', href: '/docs/charts/cloudflared', maturity: 'stable' },
      { label: 'Envoy Gateway', href: '/docs/charts/envoy-gateway', maturity: 'beta' },
      { label: 'DDNS Updater', href: '/docs/charts/ddns-updater', maturity: 'stable' },
      { label: 'Pi-hole', href: '/docs/charts/pihole', maturity: 'stable' },
      { label: 'AdGuard Home', href: '/docs/charts/adguard-home', maturity: 'stable' },
    ],
  },
  {
    label: 'Automation & AI',
    charts: [
      { label: 'n8n', href: '/docs/charts/n8n', maturity: 'stable' },
      { label: 'Flowise', href: '/docs/charts/flowise', maturity: 'stable' },
      { label: 'Open WebUI', href: '/docs/charts/open-webui', maturity: 'stable' },
      { label: 'OliveTin', href: '/docs/charts/olivetin', maturity: 'stable' },
      { label: 'Cronicle', href: '/docs/charts/cronicle', maturity: 'stable' },
      { label: 'Automatisch', href: '/docs/charts/automatisch', maturity: 'stable' },
      { label: 'FastMCP Server', href: '/docs/charts/fastmcp-server', maturity: 'stable' },
    ],
  },
  {
    label: 'Home Automation',
    charts: [{ label: 'openHAB', href: '/docs/charts/openhab', maturity: 'beta' }],
  },
  {
    label: 'Monitoring & Ops',
    charts: [
      { label: 'Uptime Kuma', href: '/docs/charts/uptime-kuma', maturity: 'stable' },
      { label: 'Velero', href: '/docs/charts/velero', maturity: 'stable' },
      { label: 'changedetection.io', href: '/docs/charts/changedetection', maturity: 'stable' },
    ],
  },
  {
    label: 'Dashboards & Admin',
    charts: [
      { label: 'Heimdall', href: '/docs/charts/heimdall', maturity: 'stable' },
      { label: 'Homarr', href: '/docs/charts/homarr', maturity: 'stable' },
      { label: 'phpMyAdmin', href: '/docs/charts/phpmyadmin', maturity: 'stable' },
      { label: 'Discount Bandit', href: '/docs/charts/discount-bandit', maturity: 'stable' },
    ],
  },
  {
    label: 'Dev Tools',
    charts: [
      { label: 'Gitea', href: '/docs/charts/gitea', maturity: 'stable' },
      { label: 'Guacamole', href: '/docs/charts/guacamole', maturity: 'stable' },
      { label: 'Answer', href: '/docs/charts/answer', maturity: 'stable' },
    ],
  },
  {
    label: 'Platform & ERP',
    charts: [
      { label: 'Appwrite', href: '/docs/charts/appwrite', maturity: 'stable' },
      { label: 'Dolibarr', href: '/docs/charts/dolibarr', maturity: 'stable' },
      { label: 'ChiefOnboarding', href: '/docs/charts/chiefonboarding', maturity: 'stable' },
      { label: 'alf.io', href: '/docs/charts/alfio', maturity: 'stable' },
      { label: 'Minecraft', href: '/docs/charts/minecraft', maturity: 'stable' },
      { label: 'Generic', href: '/docs/charts/generic', maturity: 'stable' },
    ],
  },
  {
    label: 'Analytics',
    charts: [
      { label: 'Umami', href: '/docs/charts/umami', maturity: 'stable' },
      { label: 'Metabase', href: '/docs/charts/metabase', maturity: 'stable' },
      { label: 'Liwan', href: '/docs/charts/liwan', maturity: 'stable' },
      { label: 'Countly', href: '/docs/charts/countly', maturity: 'stable' },
      { label: 'Apache Superset', href: '/docs/charts/superset', maturity: 'stable' },
      { label: 'CKAN', href: '/docs/charts/ckan', maturity: 'stable' },
      { label: 'Apache Druid', href: '/docs/charts/druid', maturity: 'stable' },
      { label: 'Elasticsearch', href: '/docs/charts/elasticsearch', maturity: 'alpha' },
    ],
  },
  {
    label: 'Archiving & Fitness',
    charts: [
      { label: 'Wallabag', href: '/docs/charts/wallabag', maturity: 'stable' },
      { label: 'Strava Statistics', href: '/docs/charts/strava-statistics', maturity: 'stable' },
      { label: 'ArchiveBox', href: '/docs/charts/archivebox', maturity: 'stable' },
      { label: 'Karakeep', href: '/docs/charts/karakeep', maturity: 'stable' },
      { label: 'Middleware', href: '/docs/charts/middleware', maturity: 'stable' },
    ],
  },
];

/** Flat list for prev/next navigation */
const allChartNavItems: NavItem[] = chartCategories.flatMap((cat) => cat.charts);

export const allPages: NavItem[] = [{ label: 'Documentation', href: '/docs' }, ...sidebarNav, ...allChartNavItems];
