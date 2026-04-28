## Summary

-

## Quality Gates

- [ ] `npm run lint`
- [ ] `npm run format:check`
- [ ] `npm run build`

## Blog Discovery Validation

Complete this section when the PR adds or changes files under `src/content/blog/`.

- Blog file:
- Canonical URL:
- Author profile:
- Cover image path:
- Cover image size:
- Schema type:
- RSS inclusion checked:
- Sitemap inclusion checked:
- IndexNow action:
- Official references reviewed:

Additional blog checks:

- [ ] Frontmatter follows `/docs/blog-authoring`
- [ ] Cover image is unique, article-specific, under `/public/blog/`, at least 1200px wide, and near 16:9
- [ ] `coverAlt` describes the image in article context
- [ ] Built metadata emits article-specific `og:image` and `twitter:image`
- [ ] Built metadata emits `max-image-preview:large`
- [ ] Built page emits Article JSON-LD matching `schemaType`
- [ ] Author profile link works
- [ ] Related/latest posts block was checked when implemented
- [ ] Discover eligibility and IndexNow notification are understood as non-guarantees

## Related Issue

Related to #
