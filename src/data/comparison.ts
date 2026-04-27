export interface ComparisonRow {
  aspect: string;
  helmforge: string;
  bitnami: string;
  community: string;
  highlight?: boolean;
}

export const comparisonFull: ComparisonRow[] = [
  {
    aspect: 'Container images',
    helmforge: 'Official upstream images',
    bitnami: 'Custom Bitnami-built images',
    community: 'Varies',
    highlight: true,
  },
  {
    aspect: 'Image tags',
    helmforge: 'Pinned, immutable versions',
    bitnami: 'Bitnami-specific rolling tags',
    community: 'Often :latest or unpinned',
    highlight: true,
  },
  {
    aspect: 'License',
    helmforge: 'Apache-2.0 — CNCF-aligned open source',
    bitnami: 'Apache 2.0 charts; images under EULA',
    community: 'Varies',
    highlight: true,
  },
  {
    aspect: 'Pricing / Tiering',
    helmforge: '100% Free forever',
    bitnami: 'Free only for deprecated legacy images (requires Sales for production)',
    community: 'Usually Free',
    highlight: true,
  },
  {
    aspect: 'Free images',
    helmforge: 'Official upstream, always updated',
    bitnami: 'Moved to bitnamilegacy/* — no longer updated',
    community: 'Varies',
    highlight: true,
  },
  { aspect: 'Vendor lock-in', helmforge: 'None', bitnami: 'Tied to Bitnami images', community: 'Low', highlight: true },
  {
    aspect: 'Built-in backup',
    helmforge: 'S3-compatible on 17+ charts',
    bitnami: 'Not included',
    community: 'Rarely included',
  },
  {
    aspect: 'Values design',
    helmforge: 'Product-oriented (e.g. database.host)',
    bitnami: 'Kubernetes-centric abstractions',
    community: 'Varies',
  },
  {
    aspect: 'Database subcharts',
    helmforge: 'Self-contained HelmForge subcharts',
    bitnami: 'Self-contained (Bitnami)',
    community: 'External dependencies',
  },
  {
    aspect: 'Security defaults',
    helmforge: 'Non-root, tight security contexts',
    bitnami: 'Non-root',
    community: 'Varies wildly',
    highlight: true,
  },
  { aspect: 'Schema validation', helmforge: 'Every chart', bitnami: 'Some charts', community: 'Rare' },
  {
    aspect: 'Supply chain signing',
    helmforge: 'GPG provenance + Cosign on every artifact',
    bitnami: 'Image signatures',
    community: 'Rare',
  },
  {
    aspect: 'CI pipeline',
    helmforge: 'Lint + template + unittest + kubeconform',
    bitnami: 'Internal CI',
    community: 'Minimal or none',
  },
];

export interface ComparisonSummaryRow {
  feature: string;
  generic: string;
  bitnami: string;
  helmforge: string;
}

export const comparisonSummary: ComparisonSummaryRow[] = [
  {
    feature: 'Container images',
    generic: 'Often custom-built or wrapped',
    bitnami: 'Custom-built Bitnami wrappers',
    helmforge: 'Official upstream images only',
  },
  {
    feature: 'Backup',
    generic: 'Separate tooling needed',
    bitnami: 'Varies, prone to breakages',
    helmforge: 'Built-in S3-compatible via CronJob',
  },
  {
    feature: 'License',
    generic: 'Varies (some restrictive)',
    bitnami: 'Proprietary for production secure images',
    helmforge: 'Apache-2.0 — open source',
  },
  {
    feature: 'Pricing / Tiering',
    generic: 'Usually Free',
    bitnami: 'Free only for deprecated legacy images (requires Sales for production)',
    helmforge: '100% Free forever',
  },
  {
    feature: 'Database subcharts',
    generic: 'External dependencies (e.g., Bitnami)',
    bitnami: 'Self-contained (Bitnami)',
    helmforge: 'Self-contained HelmForge subcharts',
  },
  {
    feature: 'Values design',
    generic: 'Kubernetes-centric (containers[].ports)',
    bitnami: 'Application-centric but complex',
    helmforge: 'Product-oriented (e.g. database.host)',
  },
  {
    feature: 'Security defaults',
    generic: 'Varies wildly',
    bitnami: 'Non-root',
    helmforge: 'Non-root, tight security contexts',
  },
];
