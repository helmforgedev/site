# HelmForge Site — Backlog V3

> Previous backlogs: V1 (PRs #50–#59), V2 (PRs #60–#69). All phases delivered and merged.

## Status

| Phase | Title | Status | PR |
|-------|-------|--------|-----|
| 1 | Blog & News Section | `pending` | — |
| 2 | Chart Documentation Enrichment | `pending` | — |
| 3 | Accessibility & a11y Tests | `pending` | — |
| 4 | Roadmap & Community Pages | `pending` | — |
| 5 | FAQ & Troubleshooting | `pending` | — |
| 6 | Architecture Diagrams | `pending` | — |
| 7 | Performance & Web Vitals | `pending` | — |
| 8 | SEO & Social Enhancements | `pending` | — |
| 9 | Advanced Playground Features | `pending` | — |
| 10 | i18n PT-BR | `pending` | — |

---

## Phase 1 — Blog & News Section

**Goal:** Add a blog/news section for announcements, tutorials, and release highlights beyond the auto-generated changelog.

**Tasks:**
- Create `/blog` index page with card grid layout
- Create `src/content/blog/` collection with MDX support
- Build `BlogLayout.astro` with reading time, author, date, share links
- Add blog link to header navigation and footer
- Create first 3 seed posts:
  - "Introducing HelmForge: Why we built it"
  - "HelmForge vs Bitnami: A practical comparison"
  - "How to deploy a production-ready PostgreSQL on Kubernetes"
- Add blog posts to Pagefind search index
- Add blog posts to RSS feed
- Add JSON-LD Article schema per post

**Priority:** High — drives organic SEO traffic and positions the project as a thought leader.

---

## Phase 2 — Chart Documentation Enrichment

**Goal:** Upgrade chart docs from basic install guides to comprehensive operational references.

**Tasks:**
- Add `values.yaml` reference table to each chart page (key, type, default, description)
- Add YAML snippet examples for common deployment patterns per chart:
  - Standalone with backup
  - Replication/HA mode
  - With Ingress + TLS
- Add "Upgrade Notes" section per chart for version migration
- Add "Common Issues" callout boxes with solutions
- Add version badge showing latest chart version (fetched at build time from GitHub API)
- Create `DocsTabs.astro` component for switching between deployment examples

**Priority:** High — directly helps users adopt charts and reduces support burden.

---

## Phase 3 — Accessibility & a11y Tests

**Goal:** Ensure WCAG 2.1 AA compliance and add automated accessibility testing.

**Tasks:**
- Install `@axe-core/playwright` and add a11y assertions to E2E tests
- Audit and fix color contrast ratios (especially text-muted in both themes)
- Add `aria-label` to all interactive elements missing labels
- Add skip-to-content link focus styles
- Fix heading hierarchy on all pages (no skipping h2→h4)
- Add focus-visible outlines on all interactive elements
- Test full keyboard navigation flow (Tab, Escape, Enter)
- Add E2E test: run axe-core scan on homepage, docs, and playground
- Add `prefers-contrast` media query support for high-contrast mode

**Priority:** High — legal compliance and inclusive design.

---

## Phase 4 — Roadmap & Community Pages

**Goal:** Add transparency about project direction and lower the bar for contributions.

**Tasks:**
- Create `/roadmap` page with milestone cards and timeline visualization
- Fetch GitHub milestones from `helmforgedev/charts` at build time
- Create `/community` page with:
  - How to contribute (link to CONTRIBUTING.md)
  - Chart request process
  - Project governance summary
  - Contributor showcase (fetch from GitHub API)
- Add community/roadmap to footer navigation
- Add JSON-LD schema for the project roadmap

**Priority:** Medium — builds trust with potential adopters and contributors.

---

## Phase 5 — FAQ & Troubleshooting

**Goal:** Reduce repetitive questions and help users self-serve common issues.

**Tasks:**
- Create `/docs/faq` page with collapsible `<details>` sections
- Organize into categories: Installation, Configuration, Backup, Networking, Compatibility
- Create `/docs/troubleshooting` page with symptom → diagnosis → fix format
- Add FAQ schema (JSON-LD FAQPage) for Google rich results
- Seed with 15+ common questions:
  - "How do I use a different ingress controller?"
  - "How do I configure S3 backup with MinIO?"
  - "How do I upgrade a chart without downtime?"
  - "Why does my pod stay in CrashLoopBackOff?"
  - "How do I use HelmForge with ArgoCD / Flux?"
- Cross-link FAQ entries from relevant chart docs
- Add FAQ to docs sidebar navigation

**Priority:** Medium — high SEO value (FAQ rich results) and reduces support load.

---

## Phase 6 — Architecture Diagrams

**Goal:** Add visual diagrams for charts with complex topologies to aid understanding.

**Tasks:**
- Create reusable `ArchitectureDiagram.astro` component using inline SVG
- Design diagrams for top charts:
  - PostgreSQL standalone vs replication
  - Redis standalone vs Sentinel
  - MySQL standalone vs source-replica
  - Keycloak with external database
  - n8n queue mode architecture
  - Appwrite microservices topology
  - Kafka KRaft cluster
- Diagrams must support dark/light themes (use CSS currentColor)
- Add diagrams to respective chart doc pages
- Make diagrams responsive (scale to container width)
- Keep diagrams as SVG in `public/diagrams/` for reuse

**Priority:** Medium — significantly improves comprehension for complex deployments.

---

## Phase 7 — Performance & Web Vitals

**Goal:** Track and optimize Core Web Vitals, add performance CI gates.

**Tasks:**
- Add `web-vitals` library for runtime performance tracking
- Send CWV metrics to GA4 as custom events (LCP, FID, CLS, TTFB, INP)
- Add Lighthouse CI to GitHub Actions (performance budget: ≥90)
- Optimize Largest Contentful Paint:
  - Preload hero fonts
  - Add `fetchpriority="high"` to above-fold images
  - Inline critical CSS
- Optimize Cumulative Layout Shift:
  - Set explicit dimensions on all images
  - Reserve space for dynamic content
- Add `<link rel="preconnect">` for Google Fonts and GA4
- Convert chart icons to WebP with PNG fallback
- Add performance score badge to README

**Priority:** Medium — fast sites rank better and convert more users.

---

## Phase 8 — SEO & Social Enhancements

**Goal:** Maximize search engine visibility and social media sharing.

**Tasks:**
- Generate unique OG images per chart using `@vercel/og` or Satori
- Add `article:published_time` and `article:modified_time` meta for blog posts
- Add BreadcrumbList JSON-LD to all pages (not just docs)
- Add SoftwareSourceCode JSON-LD per chart page
- Create `/sitemap-charts.xml` with chart-specific metadata
- Add `hreflang` tags when i18n is added (Phase 10)
- Add Twitter/X card preview optimization
- Verify and optimize all meta description lengths (150-160 chars)
- Add canonical URLs to prevent duplicate content
- Submit structured data to Google Search Console for validation

**Priority:** Medium — compounds over time for organic discovery.

---

## Phase 9 — Advanced Playground Features

**Goal:** Make the playground a comprehensive interactive tool for chart configuration.

**Tasks:**
- Add more chart-specific configurations to playground:
  - Ingress settings (host, TLS, className)
  - Resource requests/limits (CPU, memory)
  - Backup settings (schedule, endpoint, bucket)
  - Authentication (passwords, secrets)
- Add "Generate values.yaml" button that outputs a complete values file
- Add "Deploy to Cluster" documentation popup (kubectl apply flow)
- Add visual diff view showing changes from defaults
- Add shareable playground URLs (encode config in query params)
- Add cost estimation hint based on resource requests
- Add pre-built scenario buttons per chart (development, staging, production)

**Priority:** Low — nice-to-have that increases engagement and stickiness.

---

## Phase 10 — i18n PT-BR

**Goal:** Add Portuguese (Brazil) translation as first non-English language.

**Tasks:**
- Configure Astro i18n with `defaultLocale: 'en'` and `locales: ['en', 'pt-br']`
- Create translation JSON files for UI strings (header, footer, buttons, labels)
- Translate main pages: home, docs index, getting-started, comparison, FAQ
- Translate top 10 chart docs (postgresql, mysql, redis, mongodb, keycloak, etc.)
- Add language switcher to header (globe icon dropdown)
- Add `hreflang` alternate links in `<head>`
- Update sitemap to include localized URLs
- Keep English as canonical, PT-BR as alternate
- Add PT-BR to Pagefind search index

**Priority:** Low — the user (maintainer) is PT-BR native; adds accessibility for LATAM community.

---

## Priority Matrix

| Priority | Phases | Rationale |
|----------|--------|-----------|
| **High** | 1, 2, 3 | SEO, user experience, compliance |
| **Medium** | 4, 5, 6, 7, 8 | Trust, discoverability, comprehension |
| **Low** | 9, 10 | Engagement, internationalization |

## Notes

- Execute phases sequentially (1 → 10)
- Each phase = 1 branch + 1 PR to `main`
- Branch naming: `feat/<description>` or `docs/<description>`
- All phases must pass CI (lint, format, build, bundle budget, links, E2E)
- Blog content can be AI-assisted but must be reviewed for accuracy
- Architecture diagrams should be hand-crafted SVGs, not generated images
- i18n should not break existing English URLs
