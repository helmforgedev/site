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
├── styles/
│   └── global.css         # Tailwind theme, prose styles
public/
├── favicon.svg            # Site favicon (SVG)
├── og-default.png         # Open Graph image (1200x630)
└── robots.txt             # Search engine directives
```

## Development Rules

### Mandatory Checklist

Before every push, verify:

1. `npm run build` must complete without errors
2. All new pages are registered in the sidebar navigation
3. All new chart docs are registered in both sidebar and landing page grid
4. No hardcoded URLs — always use `Astro.site` or `Astro.url` for absolute URLs

### Page Creation Rules

Every new page or document MUST follow these steps:

1. **Frontmatter is required** — every MDX file must have `layout`, `title`, and `description`:
   ```yaml
   ---
   layout: ../../../layouts/DocsLayout.astro
   title: Page Title
   description: A clear, concise description for SEO meta tags.
   ---
   ```
2. **Register in sidebar** — add the page to `DocsLayout.astro`:
   - Chart docs go in the `chartNav` array
   - Other docs go in the `sidebarNav` array
   - The `allPages` array controls prev/next navigation order
3. **Register in landing page** (charts only) — add the chart to `ChartGrid.astro` with name, slug, color, letter, and description
4. **Sitemap is automatic** — `@astrojs/sitemap` generates `sitemap-index.xml` and `sitemap-0.xml` from all pages at build time. No manual sitemap editing is needed. Just create the page and it will be included.
5. **Canonical URL is automatic** — `BaseLayout.astro` generates `<link rel="canonical">` from `Astro.url`
6. **Build to verify** — run `npm run build` and confirm the new page appears in the output

### Chart Documentation Standard

Every chart doc page (`src/pages/docs/charts/<name>.mdx`) must include:

1. Title heading (`# Chart Name`)
2. Brief description paragraph
3. **Key Features** section with bullet list
4. **Installation** section with two subsections:
   - **HTTPS repository** — `helm repo add` + `helm repo update` + `helm install`
   - **OCI registry** — `helm install oci://ghcr.io/helmforgedev/helm/<name>`
5. **Basic Example** with a `values.yaml` code block
6. **Key Values** table with columns: Key, Default, Description
7. **More Information** link to the chart's GitHub source

### SEO Rules

- Every page must have a unique `title` and `description` in frontmatter
- `description` should be 50-160 characters for optimal search results
- `title` is rendered as `{title} | HelmForge` in the browser tab
- The Open Graph image (`public/og-default.png`) is shared across all pages — if a page needs a custom OG image, add the `image` prop to the layout
- `robots.txt` allows all crawlers and points to the sitemap
- JSON-LD structured data is in `BaseLayout.astro` — update when adding new schema types

### Styling Rules

- **Global CSS must use `<style is:global>`** in `BaseLayout.astro` — without it, Astro scopes selectors with `data-astro-cid-*`, breaking MDX-rendered and dynamically injected elements
- Use `global.css` for prose styles and shared CSS — do not add inline `<style>` blocks in MDX files
- Use Tailwind utility classes in Astro components
- Custom theme values go in the `@theme` block in `global.css`
- Do not import Google Fonts via `<link>` tags — Astro 6 Fonts API handles font loading

### Component Rules

- Keep components in `src/components/`
- Components that need client-side JS should use `<script is:inline>` for small scripts or Astro's client directives for framework components
- Copy buttons on code blocks are injected via JS in `DocsLayout.astro` — do not add copy buttons manually in MDX files

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

## Git Rules

- Use Conventional Commits: `feat(site):`, `fix(site):`, `docs(site):`, `ci(site):`
- Commit subjects must be lowercase
- All commits must be authored solely by the repository owner
- Never add Co-Authored-By lines
- Keep commits focused — separate content changes from infrastructure changes

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

## Related Repositories

- [helmforgedev/charts](https://github.com/helmforgedev/charts) — Helm charts source code and CI/CD
