# Newsletter Automation (Phase C)

This repository now includes full blog-to-newsletter automation.

Workflow file:
- `.github/workflows/newsletter-draft.yml`

Script:
- `scripts/create-blog-newsletter-draft.mjs`

## What it does

1. Triggers on `push` to `main` when files under `src/content/blog/` change.
2. Reads the changed post(s) frontmatter.
3. Creates a campaign in Listmonk with idempotency marker `[blog:<slug>]`.
4. Starts sending automatically on `push` events (`AUTO_SEND=true`).
5. Uses marker-based idempotency to avoid duplicate campaigns per post.

## Manual run

Use `workflow_dispatch` with:
- `blog_post_file` (optional): path to a specific post file.
- `dry_run` (optional, default `true`): payload validation without draft creation.
- `auto_send` (optional, default `false`): start campaign delivery automatically.

## Required GitHub secrets

- `LISTMONK_BASE_URL`
- `LISTMONK_API_USER`
- `LISTMONK_API_TOKEN`
- `LISTMONK_LIST_ID`
- `LISTMONK_TEMPLATE_ID` (optional but recommended)

## Behavior notes

- If frontmatter has `newsletter: false`, the post is skipped.
- On `push` to `main`, the workflow creates and starts delivery automatically.
- On manual dispatch, you control behavior with `dry_run` and `auto_send`.
