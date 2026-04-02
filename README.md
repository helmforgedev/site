<div align="center">
  <img src="public/github-banner.svg" alt="HelmForge Banner" width="100%" />

  <p><h3>Production-ready Helm charts for Kubernetes</h3></p>
  
  <p>
    The ultimate open-source alternative to Bitnami. We package popular applications with sane defaults for security, built-in backups, and day-two operations. No proprietary layers. No limits.
  </p>

  <p>
    <a href="https://helmforge.dev"><b>Website</b></a> •
    <a href="https://helmforge.dev/docs"><b>Documentation</b></a> •
    <a href="https://github.com/helmforgedev/charts"><b>Helm Charts Repository</b></a>
  </p>

  <p>
    <a href="https://github.com/helmforgedev/site/actions/workflows/ci.yml"><img src="https://github.com/helmforgedev/site/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
    <a href="https://github.com/helmforgedev/site/actions/workflows/deploy.yml"><img src="https://github.com/helmforgedev/site/actions/workflows/deploy.yml/badge.svg" alt="Deploy" /></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
    <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs Welcome" /></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/WCAG_2.2-AA_Compliant-228B22?logo=w3c&logoColor=white" alt="WCAG 2.2 AA" />
    <img src="https://img.shields.io/badge/axe--core-Validated-663399?logo=deque&logoColor=white" alt="axe-core Validated" />
    <img src="https://img.shields.io/badge/Playwright-Chromium%20%7C%20Firefox%20%7C%20WebKit-2EAD33?logo=playwright&logoColor=white" alt="Multi-browser Testing" />
    <img src="https://img.shields.io/badge/Astro-6-FF5D01?logo=astro&logoColor=white" alt="Astro 6" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  </p>

</div>

---

## Overview

This repository contains the source code for the **HelmForge** web portal and documentation engine ([helmforge.dev](https://helmforge.dev)).

HelmForge is designed to fill the void left by commercialized chart ecosystems. It provides 100% open-source, OCI-compliant, and production-hardened Kubernetes Helm Charts, directly utilizing upstream images without proprietary vendor lock-in.

This frontend is built for extreme performance, rich aesthetics, and massive SEO discoverability.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | [Astro 6](https://astro.build/) | Ultra-fast static site generator with zero JS by default |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first CSS with native design tokens |
| Content | [MDX](https://mdxjs.com/) | Markdown components driving the entire documentation portal |
| Search | [Pagefind](https://pagefind.app/) | Static search index with instant client-side results |
| E2E Testing | [Playwright](https://playwright.dev/) | Multi-browser testing across Chromium, Firefox, and WebKit |
| Accessibility | [axe-core](https://github.com/dequelabs/axe-core) | Automated WCAG 2.2 AA compliance validation |
| Linting | [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/) | Code quality and consistent formatting |

## Features

- **33 chart playground configs** — Interactive playground with live YAML preview for every stable chart
- **Stack Builder** — Compose multi-chart stacks visually and export install commands
- **Full documentation** — MDX-powered docs with sidebar navigation, search, and copy-to-clipboard
- **Public roadmap** — GitHub Milestones integration with static timeline
- **Chart request form** — Pre-filled GitHub issue creation for new chart suggestions
- **Dark/Light themes** — System-aware theme toggle with smooth transitions

## Accessibility & Compliance

The site is built to **WCAG 2.2 Level AA** standards and validated on every PR:

- **axe-core** scans all 9 major pages with `wcag22aa` rule tags
- **ARIA patterns**: menu roles with keyboard navigation (ArrowDown/Up, Escape), tab panels with proper `role`/`aria-labelledby`
- **Color contrast**: all text meets 4.5:1 ratio (normal) / 3:1 (large) across both themes
- **Target sizes**: desktop minimum 36px, mobile touch targets minimum 44px
- **Form accessibility**: `autocomplete`, `aria-required`, and visible labels on all inputs
- **Skip-to-content** link for keyboard users

See [DESIGN-PRINCIPLES.md](DESIGN-PRINCIPLES.md) for the 7 UX principles governing site development.

## Quality Gates (CI)

Every pull request runs through:

| Check | Tool | What it validates |
|-------|------|-------------------|
| Lint & Format | ESLint + Prettier | Code quality and style consistency |
| Build | Astro + Pagefind | Successful build, sitemap, page count, HTML validity |
| Link Check | Custom script | All internal links resolve to valid pages |
| E2E Tests | Playwright | 225 tests across 3 browsers (Chromium, Firefox, WebKit) |
| Accessibility | axe-core | WCAG 2.2 AA on all pages, keyboard nav, ARIA roles |
| Dependency Audit | npm audit | No high-severity vulnerabilities |
| Bundle Size | Custom script | Build output stays within budget |

## Local Development

Ensure you have **Node.js >= 22** installed.

```bash
# Install dependencies
npm install

# Start the dev server at localhost:4321
npm run dev

# Build the production bundle
npm run build

# Preview the built production site
npm run preview
```

## Testing

```bash
# Run full E2E suite (Chromium + Firefox + WebKit)
npx playwright test

# Run accessibility tests only
npm run test:a11y

# Run E2E tests for a single browser
npx playwright test --project=chromium

# View test report
npx playwright show-report
```

Install Playwright browsers if running for the first time:

```bash
npx playwright install --with-deps chromium firefox webkit
```

## Related Repositories

| Repository | Description |
|-----------|-------------|
| [helmforgedev/charts](https://github.com/helmforgedev/charts) | Helm charts source, CI/CD pipelines, and release automation |

## License

This project is licensed under the [MIT License](LICENSE).
