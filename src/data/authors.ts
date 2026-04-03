export type AuthorProfile = {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  github?: string;
  linkedin?: string;
};

export const AUTHORS: Record<string, AuthorProfile> = {
  'maicon-berlofa': {
    id: 'maicon-berlofa',
    name: 'Maicon Berlofa',
    role: 'Founder and Maintainer',
    github: 'https://github.com/mberlofa',
    linkedin: 'https://www.linkedin.com/in/berlofa',
  },
};

export const DEFAULT_AUTHOR_ID = 'maicon-berlofa';
