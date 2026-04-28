export const BLOG_CATEGORIES = [
  'kubernetes',
  'helm',
  'cncf',
  'security',
  'databases',
  'operations',
  'releases',
  'comparisons',
] as const;

export type BlogCategorySlug = (typeof BLOG_CATEGORIES)[number];

export type BlogCategory = {
  slug: BlogCategorySlug;
  label: string;
  description: string;
};

export const BLOG_CATEGORY_DETAILS: Record<BlogCategorySlug, BlogCategory> = {
  kubernetes: {
    slug: 'kubernetes',
    label: 'Kubernetes',
    description: 'Cluster behavior, workloads, APIs, and operational changes that affect application teams.',
  },
  helm: {
    slug: 'helm',
    label: 'Helm',
    description: 'Packaging patterns, chart design, values contracts, and Helm repository operations.',
  },
  cncf: {
    slug: 'cncf',
    label: 'CNCF',
    description: 'Cloud native ecosystem work, project maturity, governance, and standards relevant to operators.',
  },
  security: {
    slug: 'security',
    label: 'Security',
    description: 'Supply-chain, image provenance, CVEs, policy, and secure-by-default Kubernetes deployments.',
  },
  databases: {
    slug: 'databases',
    label: 'Databases',
    description: 'PostgreSQL, Redis, MySQL, backups, replication, recovery, and stateful application operations.',
  },
  operations: {
    slug: 'operations',
    label: 'Operations',
    description: 'Practical production workflows for backups, observability, upgrades, and incident prevention.',
  },
  releases: {
    slug: 'releases',
    label: 'Releases',
    description: 'Release notes, breaking changes, migration windows, and upgrade guidance.',
  },
  comparisons: {
    slug: 'comparisons',
    label: 'Comparisons',
    description: 'Practical trade-off analysis across charts, images, platforms, and deployment patterns.',
  },
};

export function getBlogCategory(slug: BlogCategorySlug) {
  return BLOG_CATEGORY_DETAILS[slug];
}

export function slugifyBlogTag(tag: string) {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatBlogTag(tag: string) {
  return tag
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
