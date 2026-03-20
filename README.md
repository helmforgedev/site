# HelmForge Site

Landing page and documentation portal for [HelmForge](https://helmforge.dev) — production-ready Helm charts, forged for Kubernetes.

## Stack

- **[Astro 6](https://astro.build)** — static site generator with built-in Fonts API
- **[Tailwind CSS 4](https://tailwindcss.com)** — utility-first CSS framework
- **[MDX](https://mdxjs.com)** — Markdown with JSX for documentation pages
- **[Cloudflare Pages](https://pages.cloudflare.com)** — hosting and CDN

## Project Structure

```
src/
├── components/       # Reusable Astro components
│   ├── Header.astro
│   ├── Hero.astro
│   ├── Features.astro
│   ├── ChartGrid.astro
│   ├── InstallSection.astro
│   ├── CodeBlock.astro
│   └── Footer.astro
├── layouts/          # Page layouts
│   ├── BaseLayout.astro   # HTML shell, meta, GA4, structured data
│   └── DocsLayout.astro   # Docs sidebar, breadcrumbs, prev/next
├── pages/            # File-based routing
│   ├── index.astro        # Landing page
│   ├── 404.astro          # Custom 404
│   └── docs/              # Documentation portal (MDX)
│       ├── index.mdx
│       ├── getting-started.mdx
│       └── charts/        # Per-chart documentation
└── styles/
    └── global.css         # Tailwind theme, prose styles
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Requirements:** Node.js >= 22

## Deployment

Deployment is automated via GitHub Actions. Every push to `main` triggers:

1. `npm ci` + `npm run build`
2. `wrangler pages deploy dist` to Cloudflare Pages

**Secrets required:**

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages + DNS permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier |

## Domains

| URL | Status |
|-----|--------|
| [helmforge.dev](https://helmforge.dev) | Production |
| [www.helmforge.dev](https://www.helmforge.dev) | Production (CNAME) |
| [helmforge.pages.dev](https://helmforge.pages.dev) | Cloudflare Pages default |

## Analytics

- **Google Analytics 4** — Measurement ID: `G-5PD0B83HRE`

## Related Repositories

- [helmforgedev/charts](https://github.com/helmforgedev/charts) — Helm charts source code and CI/CD
