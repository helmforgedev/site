# Contributing to HelmForge Site

Thanks for contributing to the HelmForge public website and documentation repository.

## Flow

1. Check out `main` and pull the latest changes: `git checkout main && git pull --ff-only origin main`.
2. Create your branch: `git checkout -b feat/my-new-feature`.
3. Make changes and validate locally with `npm run dev`.
4. Run the quality gates listed below.
5. Commit using Conventional Commits.
6. Push to origin and open a pull request targeting `main`.

## Quality Gates

Run these before opening a pull request:

```bash
npm run lint
npm run format:check
npm run build
```

For blog changes, also run:

```bash
npm run blog:performance-report -- --check
```

## Adding or Updating Charts

When adding a new chart to the HelmForge catalog:

1. Ensure the chart is already published in the Helm repository.
2. Edit `src/components/ChartGrid.astro` and insert the new chart in the array.
3. Supply an explicit icon URL property if the default dashboard icon is not visually accurate.

## Blog Contributions

Blog posts live in `src/content/blog/`. Follow the [Blog Authoring Guide](/docs/blog-authoring) before opening a PR.

Required blog standards:

- Use complete frontmatter: `title`, `description`, `date`, `updatedAt`, `authorId`, `category`, `tags`, `coverImage`, `coverAlt`, and `schemaType`.
- Use a real person `authorId` from `src/data/authors.ts`.
- Store article-specific hero images in `public/blog/`.
- Use `/blog/YYYY-MM-DD-descriptive-slug-hero.webp` for hero image paths.
- Keep hero images at least 1200px wide, preferably 1600x900.
- Include official references for technical and version-sensitive claims.
- Avoid clickbait, outrage framing, curiosity gaps, and misleading previews.
- Use `BlogPosting` for standard posts and `NewsArticle` only for time-sensitive news coverage.
- Do not change `date` when updating old posts; use `updatedAt` only for material content updates.

Discovery eligibility does not guarantee that a post appears in Google Discover, Google News surfaces, Bing, or Microsoft Start. IndexNow notifies participating search engines about changed URLs, but it does not guarantee indexing.

## CSS and Accessibility

- Use the built-in Tailwind variables, such as `text-text-base` and `bg-bg-surface`, instead of hardcoded raw colors.
- Always check layouts in light mode and dark mode.
- Preserve keyboard access, focus states, semantic headings, and descriptive link text.
