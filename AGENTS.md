# AI Agent Instructions — HelmForge Site

## Overview

Landing page and documentation portal for [HelmForge](https://helmforge.dev). Built with Astro 6, Tailwind CSS 4, and MDX. Deployed to Cloudflare Pages.

## Git Workflow (Mandatory)

**Never commit directly to `main`.** All changes must go through a branch and PR.

### Branch Naming

- `feat/site-<description>` — new features or pages
- `fix/site-<description>` — bug fixes
- `refactor/site-<description>` — code restructuring
- `docs/site-<description>` — documentation changes
- `ci/site-<description>` — workflow and CI changes

### Workflow Steps

1. `git checkout main && git pull --ff-only origin main`
2. `git checkout -b <type>/site-<description>`
3. implement changes
4. `npm run build` — must pass with zero errors
5. commit with Conventional Commits: `feat(site): ...`, `fix(site): ...`, etc.
6. `git push -u origin <branch>`
7. `gh pr create --title "<conventional commit title>" --body "..."`
8. wait for CI to pass
9. merge PR (or ask user to merge)

### Commit Rules

- Conventional Commits with scope `site`
- commit subjects must be lowercase
- never add Co-Authored-By lines
- keep PR titles in the same Conventional Commit format
- always open PRs to `main` — never branch-to-branch

### Conflict Prevention

- never reuse a merged branch — always create a new one from `main`
- before starting new work, verify previous PR was merged
- always refresh local `main` before branching — deploy runs immediately after merge
- if a branch already has an open PR, check its status before pushing

## CI Pipeline

Every PR to `main` triggers the CI workflow (`.github/workflows/ci.yml`):

| Job | What it checks |
|-----|---------------|
| **Build** | `npm run build` succeeds |
| **Sitemap** | `sitemap-index.xml` is generated |
| **Page count** | Minimum expected pages are built |
| **HTML validity** | No undefined titles, no broken asset references |
| **Internal links** | All internal `href` links resolve to existing pages |
| **CI gate** | All jobs must pass |

Deploy to Cloudflare Pages only happens on push to `main` (after PR merge).

## Mandatory Rules

### Before Every Push

1. Run `npm run build` — must complete with zero errors
2. Verify new pages appear in the build output
3. Confirm sidebar navigation is updated if pages were added or removed

### Page Creation Checklist

When creating any new page:

- [ ] Add frontmatter with `layout`, `title` (unique, < 60 chars), and `description` (50-160 chars)
- [ ] Register in `DocsLayout.astro` sidebar (`sidebarNav` or `chartNav` array)
- [ ] Verify prev/next navigation order (`allPages` array)
- [ ] Run `npm run build` to confirm sitemap includes the new URL
- [ ] Sitemap is auto-generated — never edit `sitemap-*.xml` manually

When creating a new chart doc:

- [ ] All items above, plus:
- [ ] Add to `ChartGrid.astro` on the landing page
- [ ] Include Installation section with HTTPS repository and OCI registry
- [ ] Include Key Values table
- [ ] Link to GitHub source

### Page Removal Checklist

- [ ] Remove the MDX file
- [ ] Remove from `DocsLayout.astro` sidebar arrays
- [ ] Remove from `ChartGrid.astro` if it was a chart
- [ ] Run `npm run build` to verify
- [ ] Check for broken internal links from other pages

## Architecture

```
MDX page (frontmatter: layout, title, description)
  → DocsLayout.astro (sidebar, breadcrumbs, copy buttons)
    → BaseLayout.astro (meta tags, OG, canonical, GA4, JSON-LD, global CSS)
```

### Files That Must Be Updated Together

| When you change... | Also update... |
|---------------------|----------------|
| Add/remove a chart doc | `DocsLayout.astro` (chartNav) + `ChartGrid.astro` |
| Add/remove a docs page | `DocsLayout.astro` (sidebarNav) |
| Add a new font | `astro.config.mjs` (fonts) + `global.css` (@theme) |
| Change site domain | `astro.config.mjs` (site) + `robots.txt` (Sitemap URL) |
| Add structured data | `BaseLayout.astro` (JSON-LD scripts) |

### Auto-Generated (Do Not Edit)

- `dist/sitemap-index.xml`, `dist/sitemap-0.xml` — by `@astrojs/sitemap`
- `dist/_astro/*.css` — compiled by Tailwind + Astro

## Common Pitfalls

1. **Scoped styles breaking MDX**: Always use `<style is:global>` in `BaseLayout.astro`.
2. **MDX frontmatter access**: Use `Astro.props.frontmatter`, not `Astro.props`.
3. **Astro 6 fonts**: `fonts` is top-level in config, NOT under `experimental`.
4. **Variable collision in inline scripts**: All `<script is:inline>` must be wrapped in IIFE `(() => { ... })()`.
5. **Forgetting sidebar registration**: Creating an MDX file does NOT add it to the sidebar automatically.
6. **Vite warnings**: Suppressed via `rollupOptions.onwarn` — upstream Astro issue.
7. **Copy buttons**: Injected by JS in `DocsLayout.astro` — do not add manually.
8. **Committing to main**: Never commit directly. Always branch → PR → CI → merge.
