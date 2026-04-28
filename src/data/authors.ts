export type AuthorProfile = {
  id: string;
  name: string;
  role: string;
  location?: string;
  email?: string;
  bio: string;
  expertise: string[];
  affiliation: string;
  avatar?: string;
  github?: string;
  linkedin?: string;
  website?: string;
};

export const AUTHORS: Record<string, AuthorProfile> = {
  'maicon-berlofa': {
    id: 'maicon-berlofa',
    name: 'Maicon Berlofa',
    role: 'Founder and Maintainer',
    location: 'Brazil',
    email: 'maicon.berloffa@gmail.com',
    bio: 'Maicon Berlofa is the founder and maintainer of HelmForge, focused on production-ready Helm charts, Kubernetes operations, supply-chain hygiene, and open-source infrastructure automation.',
    expertise: [
      'Kubernetes operations',
      'Helm chart engineering',
      'Database platforms on Kubernetes',
      'Backup and recovery automation',
      'Open-source project governance',
    ],
    affiliation: 'HelmForge',
    github: 'https://github.com/mberlofa',
    linkedin: 'https://www.linkedin.com/in/berlofa',
    website: 'https://helmforge.dev',
  },
};

export const DEFAULT_AUTHOR_ID = 'maicon-berlofa';

export function getAuthorUrl(author: AuthorProfile) {
  return `/authors/${author.id}`;
}
