export const discoveryProperties = {
  canonicalSite: 'https://helmforge.dev',
  sitemapIndex: 'https://helmforge.dev/sitemap-index.xml',
  blogFeed: 'https://helmforge.dev/blog/rss.xml',
  googleSearchConsoleProperty: 'https://helmforge.dev/',
  bingWebmasterProperty: 'https://helmforge.dev/',
};

export const monitoringCadence = [
  {
    cadence: 'Weekly',
    owner: 'Maintainer',
    focus: 'New and updated posts, indexing status, sitemap processing, IndexNow delivery, top queries.',
  },
  {
    cadence: 'Monthly',
    owner: 'Maintainer',
    focus: 'CTR trends, Discover eligibility signals, Core Web Vitals, image indexing, source mix.',
  },
  {
    cadence: 'After each blog deploy',
    owner: 'Release owner',
    focus: 'Sitemap availability, IndexNow submission logs, RSS freshness, canonical URL reachability.',
  },
];

export const acquisitionSources = [
  'Google Search',
  'Google Discover',
  'Google News surfaces',
  'Bing',
  'Microsoft Start',
  'Social shares',
  'RSS',
  'Direct and referrals',
];

export const perPostMetrics = [
  'Clicks',
  'Impressions',
  'CTR',
  'Average position',
  'Discover clicks',
  'Bing clicks',
  'RSS/social referrals',
  'Largest Contentful Paint',
  'Interaction to Next Paint',
  'Cumulative Layout Shift',
];

export const consoleChecks = [
  {
    tool: 'Google Search Console',
    status: 'Manual account step',
    checks: [
      'Verify the https://helmforge.dev/ URL-prefix property.',
      'Submit https://helmforge.dev/sitemap-index.xml in the Sitemaps report.',
      'Inspect new blog URLs after deploy and monitor indexing status.',
      'Review Search results, Discover, Google News, Images, and Core Web Vitals reports when data is available.',
    ],
  },
  {
    tool: 'Bing Webmaster Tools',
    status: 'Manual account step',
    checks: [
      'Verify https://helmforge.dev/ or import verification from Google Search Console.',
      'Submit https://helmforge.dev/sitemap-index.xml.',
      'Review IndexNow insights, Index Coverage, URL Inspection, and SEO reports.',
      'Confirm Microsoft Start/Bing traffic is segmented in analytics reports.',
    ],
  },
  {
    tool: 'HelmForge site analytics',
    status: 'Repository configured',
    checks: [
      'GA4 measurement ID can be overridden with PUBLIC_GA_MEASUREMENT_ID.',
      'Search verification meta tags can be injected with PUBLIC_GOOGLE_SITE_VERIFICATION and PUBLIC_BING_SITE_VERIFICATION.',
      'Core Web Vitals are sent as GA4 events with page path and content group.',
      'The blog performance report template tracks per-post source and search metrics.',
    ],
  },
];

export const officialMonitoringLinks = [
  {
    label: 'Google Search Console reports',
    href: 'https://support.google.com/webmasters/answer/9133276',
  },
  {
    label: 'Google Search Console sitemaps',
    href: 'https://support.google.com/webmasters/answer/7451001',
  },
  {
    label: 'Google Core Web Vitals report',
    href: 'https://support.google.com/webmasters/answer/9205520',
  },
  {
    label: 'Bing Webmaster Tools',
    href: 'https://www.bing.com/webmasters',
  },
  {
    label: 'IndexNow documentation',
    href: 'https://www.indexnow.org/documentation',
  },
];
