# HelmForge Design Principles

This document defines the UX and design principles that govern the HelmForge website. Every page, component, and interaction must follow these principles. They are not guidelines — they are hard rules.

## 1. Clarity First

> The user must understand any screen in under 3 seconds.

- Short, direct copy — no filler words
- Clear visual hierarchy with a single obvious CTA per section
- Few elements per viewport — whitespace is a feature, not wasted space
- Every heading answers "what is this?" before the user scrolls

**Test:** Show a screen to someone for 3 seconds, then hide it. If they can't describe the purpose, it fails.

## 2. Progressive Disclosure

> Show only what is necessary first. Advanced options stay hidden until requested.

- Default view shows the essential controls
- Collapsible sections for advanced settings (e.g., Resources, Backup, Ingress in Playground)
- Expandable details for secondary information
- Never dump all options on the user at once

**Test:** If a first-time user sees more than 5–7 interactive elements at once, the screen is too complex.

## 3. Visual Hierarchy

> The eye must follow a natural flow. Without hierarchy, UI becomes visual chaos.

Tools to establish hierarchy (in order of impact):

1. **Font size** — larger = more important
2. **Font weight** — bolder = more important
3. **Spacing** — more space around = more important
4. **Color** — primary/accent = important, muted = secondary
5. **Contrast** — high contrast = foreground, low contrast = background

**Flow on every page:**

```
Hero / Title (display/h1)
  ↓
Section headers (h2)
  ↓
Content groups (h3 + body)
  ↓
Actions (buttons/links)
  ↓
Footer
```

**Test:** Squint at the page. The most important elements should still be distinguishable.

## 4. Consistency

> Predictable interfaces reduce cognitive load.

Consistency applies to:

- **Components** — same button style everywhere, same card pattern everywhere
- **Spacing** — use the spacing scale, never arbitrary values
- **Colors** — use design tokens, never hardcoded hex values
- **Behavior** — same interaction pattern for same element type
- **Language** — same terminology across all pages

This is why we maintain a design system with reusable components, tokens, and patterns.

**Test:** Can a user predict what a button/link/card will do based on how similar elements behave elsewhere on the site?

## 5. Feedback

> Every action must produce an immediate response.

| State | Response |
|-------|----------|
| Loading | Skeleton screen or spinner |
| Processing | "Saving..." / progress indicator |
| Success | Confirmation message or visual change |
| Error | Clear error message with recovery action |
| Empty | Helpful empty state with next-step guidance |

Without feedback, users assume the interface is broken.

**Implementation rules:**

- Copy-to-clipboard buttons show "Copied!" for 2 seconds
- Form submissions show loading state during processing
- Toggles animate between states (150ms transition)
- Search filters show result count updates via `aria-live`
- Failed network requests show a retry path

**Test:** Perform every interactive action on the page. If any action produces no visible/audible change, it fails.

## 6. Accessibility by Default

> Accessibility is not a feature — it is a baseline requirement.

### WCAG 2.2 Level AA Compliance

| Rule | Requirement |
|------|-------------|
| **Color contrast** | Minimum 4.5:1 for normal text, 3:1 for large text (>= 18px or >= 14px bold) |
| **Focus visible** | Every interactive element must show a visible focus indicator |
| **Target size** | Minimum 24x24px for all interactive targets (WCAG 2.5.8) |
| **Alt text** | Every `<img>` must have an `alt` attribute — decorative images use `alt=""` |
| **Labels** | Every form input must have an associated `<label>` |
| **Landmarks** | Use semantic HTML: `<header>`, `<nav>`, `<main>`, `<footer>`, `<aside>` |
| **Keyboard** | Every interactive element must be operable via keyboard |
| **ARIA** | Use ARIA roles and properties where native HTML semantics are insufficient |
| **Motion** | Respect `prefers-reduced-motion` — disable animations when set |
| **Autocomplete** | Form fields for known data types must have `autocomplete` attributes |

### Tooling

- **axe-core** in Playwright E2E tests — zero critical/serious violations on every page
- **Lighthouse** in CI — accessibility score >= 95
- **Manual testing** with keyboard navigation and screen reader (VoiceOver/NVDA)
- **Wave** browser extension for visual a11y auditing during development

**Test:** Run `npx playwright test e2e/accessibility.spec.ts` — zero violations. Navigate every page with Tab key only — every element must be reachable and operable.

## 7. Performance is UX

> Speed is not a technical metric — it is a user experience metric.

| Response time | User perception |
|--------------|-----------------|
| 0–100ms | Instantaneous |
| 100–300ms | Acceptable |
| 300ms–1s | Noticeable delay |
| > 1s | User loses flow |
| > 3s | User abandons |

### Performance budget

| Metric | Budget |
|--------|--------|
| **LCP** | < 2.5s |
| **CLS** | < 0.1 |
| **INP** | < 200ms |
| **Total JS** | < 150KB |
| **Total CSS** | < 120KB |
| **Total bundle** | < 500KB |
| **Lighthouse Performance** | >= 90 |

### Strategies

- **Static generation** — Astro renders HTML at build time, zero JS by default
- **Lazy loading** — images below the fold use `loading="lazy"`
- **Font optimization** — Astro font providers with `display: swap`
- **Search** — Pagefind runs client-side with zero-JS index loading
- **Skeleton loading** — show content structure before data loads
- **Cache** — leverage CDN caching via Cloudflare Pages

**Test:** Run Lighthouse on every page — Performance >= 90, all Core Web Vitals green.

---

## Design System Stack

```
Design Principles (this document)
        ↓
   Design Tokens (global.css)
        ↓
   Component Library (src/components/)
        ↓
   WCAG 2.2 AA Compliance (axe-core + Lighthouse)
        ↓
   E2E Quality Gate (Playwright CI)
```

### Token Categories

| Category | Location | Examples |
|----------|----------|---------|
| Colors | `--color-*` in global.css | `--color-primary`, `--color-text-base`, `--color-bg-surface` |
| Typography | `--text-*`, `--font-*` | `--text-display`, `--font-heading` (Outfit), `--font-sans` (Inter) |
| Spacing | Tailwind scale | `p-4`, `gap-6`, `mt-8` (4px base unit) |
| Radii | `--radius-*` | `--radius-sm` (0.5rem), `--radius-lg` (1rem), `--radius-xl` (1.5rem) |
| Shadows | `--shadow-*` | `--shadow-card`, `--shadow-elevated`, `--shadow-glow` |
| Motion | `--duration-*` | `--duration-fast` (150ms), `--duration-normal` (300ms), `--duration-slow` (500ms) |

### Component Patterns

| Pattern | Usage | Rounded | Padding |
|---------|-------|---------|---------|
| `glass-panel` | Cards, panels, containers | `rounded-2xl` | `p-6` |
| `Badge` | Maturity labels, status tags | `rounded-full` | `px-1.5 py-0.5` |
| `SectionHeader` | Page section titles | — | `mb-8` |
| `Container` | Page-width wrapper | — | `px-4 sm:px-6 lg:px-8`, `max-w-7xl` |
| Buttons (primary) | Main CTA | `rounded-full` | `px-5 py-2.5` |
| Buttons (secondary) | Alternate actions | `rounded-full` | `px-5 py-2.5` |
| Collapsible section | Progressive disclosure | `rounded-xl` | `py-2.5 px-3` |

### Interaction States

Every interactive element must implement these states:

| State | Visual |
|-------|--------|
| Default | Base styling |
| Hover | `hover:border-primary/40` or `hover:bg-bg-surface/60` |
| Focus | `focus-visible:outline-2 outline-primary-light outline-offset-4` |
| Active | Scale or color change |
| Disabled | `opacity-40`, `cursor-not-allowed` |
| Loading | Spinner or skeleton |

---

## Applying These Principles

When building a new page or component:

1. **Start with clarity** — what is the one thing the user needs to understand?
2. **Establish hierarchy** — title > description > content > actions
3. **Hide complexity** — progressive disclosure for optional features
4. **Use existing patterns** — check components and tokens before creating new ones
5. **Add feedback** — loading, success, error, empty states
6. **Test accessibility** — keyboard, screen reader, axe-core
7. **Check performance** — Lighthouse, bundle size, lazy loading
