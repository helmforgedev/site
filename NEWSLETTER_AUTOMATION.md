# Newsletter Automation (Phase A)

This repository now includes a Phase A automation for blog-to-newsletter drafts.

Workflow file:
- `.github/workflows/newsletter-draft.yml`

Script:
- `scripts/create-blog-newsletter-draft.mjs`

## What Phase A does

1. Triggers on `push` to `main` when files under `src/content/blog/` change.
2. Reads the changed post(s) frontmatter.
3. Creates a **draft** campaign in Listmonk (never sends automatically).
4. Uses idempotency marker `[blog:<slug>]` to avoid duplicate drafts per post.

## Manual run

Use `workflow_dispatch` with:
- `blog_post_file` (optional): path to a specific post file.
- `dry_run` (optional, default `true`): payload validation without draft creation.

## Required GitHub secrets

- `LISTMONK_BASE_URL`
- `LISTMONK_API_USER`
- `LISTMONK_API_TOKEN`
- `LISTMONK_LIST_ID`
- `LISTMONK_TEMPLATE_ID` (optional but recommended)

## Behavior notes

- If frontmatter has `newsletter: false`, the post is skipped.
- Campaign status remains `draft`; you review and send from Listmonk UI.
