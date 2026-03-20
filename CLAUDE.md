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

## Git Rules

Use Conventional Commits for commit messages and PR titles.

Scoped:

- `feat(site): ...`
- `fix(site): ...`
- `docs(site): ...`
- `refactor(site): ...`
- `ci(site): ...`
- `feat(site)!: ...` (breaking change)

Rules:

- always write commit subjects in lowercase
- keep PR titles in the same Conventional Commit format
- always open PRs from the working branch to `main`
- never create branch-to-branch PRs
- never commit directly to `main` — always use a branch and PR
- all commits must be authored solely by the repository owner
- never add Co-Authored-By lines to commits

## Branches

Use:

- `feat/site-<description>`
- `fix/site-<description>`
- `refactor/site-<description>`
- `docs/site-<description>`
- `ci/site-<description>`

Mandatory flow:

1. run `git checkout main` and `git pull --ff-only origin main`
2. create a new branch from the updated local `main`
3. implement the change
4. commit all intended files
5. push the branch
6. create a PR to `main`
7. wait for CI to pass before merging

Conflict prevention:

- never start new work from an older feature branch after its PR was merged
- always restart from current `main`
- before starting the next task, verify that the previous PR was merged and refresh local `main`
- do not assume local `main` is current after a merge; the deploy workflow runs immediately after merge

## Validation

Run before pushing:

```bash
npm run build   # Must succeed with zero errors
```

CI runs automatically on every PR and checks:

1. **Build** — `npm run build` must succeed
2. **Sitemap** — `sitemap-index.xml` must be generated
3. **Page count** — minimum expected pages must be built
4. **HTML validity** — no undefined titles, no broken asset references
5. **Internal links** — all internal `href` links must resolve

## Development Rules

### Page Creation Checklist

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
3. **Register in landing page** (charts only) — add to `ChartGrid.astro`
4. **Sitemap is automatic** — `@astrojs/sitemap` generates it at build time
5. **Canonical URL is automatic** — `BaseLayout.astro` generates it from `Astro.url`
6. **Build to verify** — run `npm run build` and confirm the new page appears

### Chart Documentation Standard

Every chart doc (`src/pages/docs/charts/<name>.mdx`) must include:

1. Title heading (`# Chart Name`)
2. Brief description paragraph
3. **Key Features** section with bullet list
4. **Installation** section with:
   - **HTTPS repository** — `helm repo add` + `helm repo update` + `helm install`
   - **OCI registry** — `helm install oci://ghcr.io/helmforgedev/helm/<name>`
5. **Basic Example** with a `values.yaml` code block
6. **Key Values** table (Key, Default, Description)
7. **More Information** link to the chart's GitHub source

### SEO Rules

- every page must have a unique `title` and `description` in frontmatter
- `description` should be 50-160 characters
- `title` renders as `{title} | HelmForge` — keep under 60 chars
- OG image at `public/og-default.png` is shared across all pages
- `robots.txt` allows all crawlers and points to the sitemap
- JSON-LD structured data lives in `BaseLayout.astro`

### Styling Rules

- global CSS in `BaseLayout.astro` MUST use `<style is:global>` — without it, Astro scopes selectors breaking MDX and dynamic content
- use `global.css` for prose styles — do not add `<style>` blocks in MDX
- do not import Google Fonts via `<link>` — Astro 6 Fonts API handles it
- all `<script is:inline>` blocks must be wrapped in IIFE `(() => { ... })()` to prevent variable collisions between components

### Component Rules

- keep components in `src/components/`
- copy buttons on code blocks are injected via JS in `DocsLayout.astro` — do not add manually in MDX

## Key Conventions

### Astro 6 Fonts API

Fonts are top-level in `astro.config.mjs` (NOT under `experimental`):

```javascript
fonts: [
  { provider: fontProviders.google(), name: 'Inter', cssVariable: '--font-inter' },
],
```

### MDX Layouts

Frontmatter accessed via `Astro.props.frontmatter` in layouts (not `Astro.props` directly).

## Deployment

Deploy is automated via GitHub Actions on push to `main`:
1. `npm ci` + `npm run build`
2. `wrangler pages deploy dist --project-name=helmforge --branch=main`

CI runs on every PR to `main` and must pass before merging.

### Secrets

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages + DNS permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier |

## Repository Learning Rule

When real work reveals a stable reusable improvement:

1. fix the concrete issue
2. convert it into a short rule if it is likely to recur
3. update the smallest relevant document in the same branch

Preferred targets: `CLAUDE.md`, `AGENTS.md`, `README.md`

## Related Repositories

- [helmforgedev/charts](https://github.com/helmforgedev/charts) — Helm charts source code and CI/CD
