# AI Agent Instructions — HelmForge Site

## Overview

This is the HelmForge landing page and documentation portal. Built with Astro 6, Tailwind CSS 4, and MDX. Deployed to Cloudflare Pages.

## Rules

- All commits use Conventional Commits with scope `site`: `feat(site):`, `fix(site):`, `docs(site):`
- Commit subjects must be lowercase
- Never add Co-Authored-By lines to commits
- All documentation must be written in English
- Run `npm run build` before pushing to verify the build succeeds

## Architecture

- `BaseLayout.astro` is the HTML shell — includes meta tags, GA4, JSON-LD, and global CSS
- `DocsLayout.astro` wraps all documentation pages — provides sidebar, breadcrumbs, prev/next navigation, and copy button injection
- MDX pages use `layout` frontmatter to select the layout
- Global CSS uses `<style is:global>` to avoid Astro scoping — this is required for styles that target MDX-rendered or dynamically created elements
- Astro 6 Fonts API handles font loading — no external Google Fonts `<link>` tags needed

## Common Pitfalls

1. **Scoped styles breaking MDX content**: Always use `<style is:global>` for styles in `BaseLayout.astro`. Astro scopes `<style>` blocks by default, which breaks selectors for MDX-rendered HTML.
2. **MDX frontmatter access**: In layouts used by MDX, access frontmatter via `Astro.props.frontmatter`, not `Astro.props` directly.
3. **Astro 6 fonts**: The `fonts` config is top-level in `astro.config.mjs`, NOT under `experimental`.
4. **Cloudflare wrangler-action**: Currently v3 (uses Node.js 20). No v4 with Node.js 24 support exists yet.

## Adding Content

### New Chart Documentation

1. Create `src/pages/docs/charts/<name>.mdx`
2. Add frontmatter with `layout`, `title`, `description`
3. Include HTTPS repository and OCI registry installation sections
4. Register in `DocsLayout.astro` sidebar (`chartNav` array)
5. Register in `ChartGrid.astro` on the landing page

### New Documentation Page

1. Create `src/pages/docs/<name>.mdx`
2. Register in `DocsLayout.astro` sidebar (`sidebarNav` array)
