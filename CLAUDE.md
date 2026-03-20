# Claude Code — HelmForge Site

## Repository

Landing page and documentation portal for [HelmForge](https://helmforge.dev). Deployed to Cloudflare Pages.

## Stack

- **Astro 6** with built-in Fonts API (Inter + JetBrains Mono)
- **Tailwind CSS 4** with `@theme` directive for custom properties
- **MDX** for documentation pages
- **Cloudflare Pages** via `wrangler pages deploy`

## Project Structure

```
src/
├── components/       # Reusable Astro components
├── layouts/
│   ├── BaseLayout.astro   # HTML shell, meta, GA4, structured data
│   └── DocsLayout.astro   # Docs sidebar, breadcrumbs, prev/next, copy buttons
├── pages/
│   ├── index.astro        # Landing page
│   ├── 404.astro          # Custom 404
│   └── docs/              # Documentation portal (MDX)
│       ├── index.mdx
│       ├── getting-started.mdx
│       └── charts/        # Per-chart documentation
└── styles/
    └── global.css         # Tailwind theme, prose styles
```

## Key Conventions

### Astro 6 Fonts API

Fonts are configured at the top level of `astro.config.mjs` (NOT under `experimental`):

```javascript
import { defineConfig, fontProviders } from 'astro/config';
export default defineConfig({
  fonts: [
    { provider: fontProviders.google(), name: 'Inter', cssVariable: '--font-inter' },
  ],
});
```

### Tailwind CSS 4

Uses `@theme` directive in `global.css` for custom properties:

```css
@theme {
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
}
```

### MDX Layouts

MDX files use frontmatter `layout` property. Frontmatter is accessed via `Astro.props.frontmatter` in layouts (not `Astro.props` directly).

### Global CSS

The global CSS import in `BaseLayout.astro` MUST use `<style is:global>` — without `is:global`, Astro scopes the selectors with `data-astro-cid-*` attributes, breaking styles for dynamically injected elements and MDX-rendered content.

### Copy Buttons

Code block copy buttons are injected via inline JS in `DocsLayout.astro`. The CSS for `.prose-copy-btn` lives in `global.css`.

## Git Rules

- Use Conventional Commits: `feat(site):`, `fix(site):`, `docs(site):`
- All commits must be authored solely by the repository owner
- Never add Co-Authored-By lines

## Deployment

Automated via GitHub Actions on push to `main`:
1. `npm ci` + `npm run build`
2. `wrangler pages deploy dist --project-name=helmforge --branch=main`

### Secrets

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages + DNS permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier |

## Validation

```bash
npm run build   # Must succeed before pushing
```

## Adding a New Chart Doc

1. Create `src/pages/docs/charts/<name>.mdx` with frontmatter:
   ```yaml
   ---
   layout: ../../../layouts/DocsLayout.astro
   title: Chart Name Chart
   description: HelmForge Chart Name chart — description.
   ---
   ```
2. Include **HTTPS repository** and **OCI registry** install sections
3. Add the chart to `sidebarNav` or `chartNav` in `DocsLayout.astro`
4. Add the chart to `ChartGrid.astro` on the landing page

## Related Repositories

- [helmforgedev/charts](https://github.com/helmforgedev/charts) — Helm charts source code and CI/CD
