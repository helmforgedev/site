export interface NavItem {
  label: string;
  href: string;
}

export const sidebarNav: NavItem[] = [
  { label: 'Getting Started', href: '/docs/getting-started' },
  { label: 'Charts Overview', href: '/docs/charts' },
  { label: 'Stack Examples', href: '/docs/stack-examples' },
  { label: 'HelmForge vs Other Charts', href: '/docs/comparison' },
];

export const chartNav: NavItem[] = [
  { label: 'Generic', href: '/docs/charts/generic' },
  { label: 'MySQL', href: '/docs/charts/mysql' },
  { label: 'PostgreSQL', href: '/docs/charts/postgresql' },
  { label: 'Redis', href: '/docs/charts/redis' },
  { label: 'MongoDB', href: '/docs/charts/mongodb' },
  { label: 'RabbitMQ', href: '/docs/charts/rabbitmq' },
  { label: 'Keycloak', href: '/docs/charts/keycloak' },
  { label: 'Vaultwarden', href: '/docs/charts/vaultwarden' },
  { label: 'Minecraft', href: '/docs/charts/minecraft' },
  { label: 'Pi-hole', href: '/docs/charts/pihole' },
  { label: 'WordPress', href: '/docs/charts/wordpress' },
  { label: 'Strapi', href: '/docs/charts/strapi' },
  { label: 'Answer', href: '/docs/charts/answer' },
  { label: 'n8n', href: '/docs/charts/n8n' },
  { label: 'Komga', href: '/docs/charts/komga' },
  { label: 'Guacamole', href: '/docs/charts/guacamole' },
  { label: 'Cloudflared', href: '/docs/charts/cloudflared' },
  { label: 'DDNS Updater', href: '/docs/charts/ddns-updater' },
  { label: 'Uptime Kuma', href: '/docs/charts/uptime-kuma' },
  { label: 'Appwrite', href: '/docs/charts/appwrite' },
  { label: 'Authelia', href: '/docs/charts/authelia' },
  { label: 'AdGuard Home', href: '/docs/charts/adguard-home' },
  { label: 'Velero', href: '/docs/charts/velero' },
  { label: 'Kafka', href: '/docs/charts/kafka' },
  { label: 'Dolibarr', href: '/docs/charts/dolibarr' },
  { label: 'Mosquitto', href: '/docs/charts/mosquitto' },
  { label: 'Docmost', href: '/docs/charts/docmost' },
  { label: 'Flowise', href: '/docs/charts/flowise' },
  { label: 'phpMyAdmin', href: '/docs/charts/phpmyadmin' },
  { label: 'Heimdall', href: '/docs/charts/heimdall' },
  { label: 'Gitea', href: '/docs/charts/gitea' },
  { label: 'Homarr', href: '/docs/charts/homarr' },
  { label: 'MariaDB', href: '/docs/charts/mariadb' },
];

export const allPages: NavItem[] = [
  { label: 'Documentation', href: '/docs' },
  ...sidebarNav,
  ...chartNav,
];
