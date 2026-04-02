# HelmForge Brand Guide

Reference for consistent visual identity across the website, documentation, social media, and community materials.

---

## Logo

The HelmForge logo is a stylized **H** made of two italic parallelograms (legs) connected by a horizontal crossbar. The shape evokes forging, solidity, and the Helm ship wheel.

### Variants

| File | Usage |
|------|-------|
| `logos/helmforge-icon.svg` | Default icon (uses `currentColor` gradients) |
| `logos/helmforge-icon-dark-bg.svg` | Icon on dark backgrounds |
| `logos/helmforge-icon-light-bg.svg` | Icon on light backgrounds (higher-contrast gradients) |
| `logos/helmforge-icon-mono-white.svg` | Monochrome white — watermarks, dark solid backgrounds |
| `logos/helmforge-icon-mono-dark.svg` | Monochrome dark — print, light solid backgrounds |
| `logos/helmforge-horizontal.svg` | Icon + wordmark, horizontal (uses `currentColor`) |
| `logos/helmforge-horizontal-dark-bg.svg` | Horizontal, white text for dark backgrounds |
| `logos/helmforge-horizontal-light-bg.svg` | Horizontal, dark text for light backgrounds |
| `logos/helmforge-vertical.svg` | Icon above wordmark + tagline |

### PNG Exports

Icon PNGs in `logos/`: 64, 128, 256, 512, 1024px.

### Clear Space

Maintain a minimum clear space around the logo equal to the height of the crossbar on all sides. Do not place text, borders, or other elements inside this zone.

### Don'ts

- Do not rotate, stretch, or skew the logo
- Do not change the gradient colors
- Do not add drop shadows, outlines, or effects
- Do not place the full-color logo on busy or multicolored backgrounds — use monochrome instead
- Do not recreate the logo from scratch — always use the SVG source files

---

## Colors

### Primary Palette (Dark Mode — Default)

| Token | Hex | RGB | HSL | Tailwind | Usage |
|-------|-----|-----|-----|----------|-------|
| `--color-primary` | `#7c3aed` | 124, 58, 237 | 263, 83%, 58% | violet-600 | Buttons, links, accents |
| `--color-primary-light` | `#a78bfa` | 167, 139, 250 | 255, 92%, 76% | violet-400 | Hover states, highlights |
| `--color-primary-dark` | `#5b21b6` | 91, 33, 182 | 263, 69%, 42% | violet-800 | Active states, deep accents |
| `--color-accent` | `#ea580c` | 234, 88, 12 | 21, 90%, 48% | orange-600 | "Forge" wordmark, CTAs |
| `--color-accent-light` | `#f97316` | 249, 115, 22 | 25, 95%, 53% | orange-500 | Hover accent, terminal prompt |

### Backgrounds & Surfaces (Dark Mode)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg-base` | `#070708` | Page background |
| `--color-bg-surface` | `#121215` | Cards, panels, elevated surfaces |
| `--color-bg-glass` | `rgba(18, 18, 21, 0.65)` | Glassmorphism panels (with backdrop-blur) |
| `--color-border` | `#212126` | Borders, dividers |

### Text (Dark Mode)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-text-base` | `#ffffff` | Headings, primary text |
| `--color-text-muted` | `#a1a1aa` | Body text, descriptions, labels |

### Light Mode Overrides

| Token | Dark | Light | Notes |
|-------|------|-------|-------|
| `--color-bg-base` | `#070708` | `#fdfdfd` | Near-white |
| `--color-bg-surface` | `#121215` | `#ffffff` | Pure white |
| `--color-bg-glass` | `rgba(18,18,21,0.65)` | `rgba(255,255,255,0.75)` | |
| `--color-border` | `#212126` | `#e4e4e7` | zinc-200 |
| `--color-text-base` | `#ffffff` | `#18181b` | Near-black |
| `--color-text-muted` | `#a1a1aa` | `#52525b` | zinc-600 |
| `--color-primary` | `#7c3aed` | `#6d28d9` | Slightly darker for contrast |
| `--color-primary-light` | `#a78bfa` | `#7c3aed` | |

### Logo Gradients

| Element | Start | Mid | End |
|---------|-------|-----|-----|
| Left leg | `#a78bfa` | — | `#6d28d9` |
| Right leg | `#fb923c` | — | `#ea580c` |
| Crossbar | `#8b5cf6` | `#f43f5e` | `#ea580c` |

---

## Typography

### Font Families

| Role | Family | Weight | CSS Variable |
|------|--------|--------|--------------|
| **Headings** | Outfit | 700 (Bold), 800 (Extra Bold) | `--font-heading` |
| **Body** | Inter | 400 (Regular), 500 (Medium), 600 (Semibold) | `--font-sans` |
| **Code** | JetBrains Mono | 400, 500 | `--font-mono` |

### Type Scale

| Level | Size | Weight | Font | Usage |
|-------|------|--------|------|-------|
| Display | `text-5xl` to `text-7xl` | 800 | Outfit | Hero headline |
| H1 | `clamp(2.25rem, 4vw, 3rem)` | 800 | Outfit | Page titles |
| H2 | `1.75rem` | 700 | Outfit | Section headings |
| H3 | `1.25rem` | 600 | Outfit | Subsection headings |
| Body | `1rem` / `text-base` | 400 | Inter | Paragraphs |
| Small | `0.875rem` / `text-sm` | 400-500 | Inter | Labels, meta, nav |
| Caption | `0.75rem` / `text-xs` | 500-700 | Inter | Badges, timestamps |
| Code | `0.875rem` | 400 | JetBrains Mono | Inline and block code |

### Tracking & Leading

- Headings: `tracking-tight` (`letter-spacing: -0.025em`)
- Section labels: `tracking-[0.18em]` (wide uppercase labels)
- Body: default tracking, `leading-relaxed` (`line-height: 1.625`)

---

## Spacing & Layout

| Pattern | Value | Usage |
|---------|-------|-------|
| Page max-width | `max-w-7xl` (80rem) | All sections |
| Horizontal padding | `px-4 sm:px-6 lg:px-8` | Responsive container |
| Section vertical | `py-16 sm:py-20` to `py-20 lg:py-28` | Between major sections |
| Card padding | `p-5` to `p-6` | Inside glass-panel cards |
| Card gap | `gap-4` | Grid gaps |

---

## Effects

### Glassmorphism

```css
.glass-panel {
  background-color: var(--color-bg-glass);
  backdrop-filter: blur(24px);
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}
```

### Glow Effect

Applied to primary CTA buttons. Gradient pseudo-element with `blur(3px)` appears on hover.

### Hover Animations

- Cards: `hover:-translate-y-1` with `hover:shadow-xl`
- Icons: `group-hover:scale-110`
- Transitions: `duration-300` default, `duration-500` for opacity

---

## Favicons & Manifest

| File | Size | Location |
|------|------|----------|
| `favicon.svg` | scalable | `/public/favicon.svg` |
| `favicon.ico` | 32x32 | `/public/favicon.ico` |
| `apple-touch-icon.png` | 180x180 | `/public/apple-touch-icon.png` |
| `favicon-192.png` | 192x192 | `/public/favicon-192.png` |
| `favicon-512.png` | 512x512 | `/public/favicon-512.png` |
| `site.webmanifest` | — | `/public/site.webmanifest` |

---

## Social & OG Images

| File | Size | Usage |
|------|------|-------|
| `banners/og-default.png` | 1200x630 | Open Graph / Facebook |
| `banners/twitter-card.png` | 1200x600 | Twitter card |
| `banners/github-banner.png` | 1280x640 | GitHub repo social preview |

---

## Regenerating Assets

```bash
node scripts/generate-brand-assets.mjs
```

This generates all PNGs from SVG sources using sharp. Run after changing any SVG in `brand/logos/` or `public/github-banner.svg`.
