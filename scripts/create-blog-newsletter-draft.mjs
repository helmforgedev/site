import fs from 'node:fs/promises';
import path from 'node:path';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function normalizePostFiles() {
  const argFiles = process.argv.slice(2);
  if (argFiles.length > 0) return argFiles;

  const raw = process.env.BLOG_POST_FILES ?? '';
  return raw
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseBoolean(value, fallback = false) {
  if (value == null) return fallback;
  return String(value).toLowerCase() === 'true';
}

function stripQuotes(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseFrontmatter(content) {
  if (!content.startsWith('---\n')) return {};
  const end = content.indexOf('\n---\n', 4);
  if (end === -1) return {};

  const frontmatter = content.slice(4, end);
  const data = {};

  for (const line of frontmatter.split('\n')) {
    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) continue;

    const key = match[1];
    const rawValue = match[2] ?? '';

    if (rawValue === 'true' || rawValue === 'false') {
      data[key] = rawValue === 'true';
      continue;
    }

    data[key] = stripQuotes(rawValue);
  }

  return data;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function apiRequest({ baseUrl, authHeader, method, endpoint, body }) {
  const res = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Listmonk API ${method} ${endpoint} failed (${res.status}): ${text}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

async function findExistingCampaignByMarker({ baseUrl, authHeader, marker }) {
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await apiRequest({
      baseUrl,
      authHeader,
      method: 'GET',
      endpoint: `/api/campaigns?page=${page}&per_page=${perPage}`,
    });

    const results = response?.data?.results ?? [];
    const existing = results.find((campaign) => String(campaign?.name ?? '').includes(marker));
    if (existing) return existing;

    const total = Number(response?.data?.total ?? 0);
    if (total <= page * perPage || results.length === 0) return null;
    page += 1;
  }
}

function buildCampaignHtml({ title, description, postUrl, publishedAt }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeDate = escapeHtml(publishedAt);
  const trackedUrl = `${postUrl}@TrackLink`;

  return `
<h1 style="margin:0 0 12px;font-size:28px;line-height:1.25;color:#111827;">${safeTitle}</h1>
<p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:#374151;">${safeDescription}</p>
<p style="margin:0 0 22px;">
  <a href="${trackedUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;">
    Read full post
  </a>
</p>
<p style="margin:0;color:#6b7280;font-size:13px;">Published: ${safeDate}</p>
`.trim();
}

async function appendSummary(lines) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;
  await fs.appendFile(summaryPath, `${lines.join('\n')}\n`, 'utf8');
}

async function processPost({
  postFile,
  baseUrl,
  authHeader,
  siteBaseUrl,
  listIds,
  templateId,
  dryRun,
}) {
  const absolutePath = path.resolve(postFile);
  const source = await fs.readFile(absolutePath, 'utf8');
  const frontmatter = parseFrontmatter(source);
  const slug = (frontmatter.slug || path.basename(postFile, path.extname(postFile))).trim();

  if (frontmatter.newsletter === false) {
    return { status: 'skipped', reason: 'newsletter=false', slug, postFile };
  }

  const title = (frontmatter.title || slug).trim();
  const description = (frontmatter.description || `New post published on HelmForge: ${title}`).trim();
  const rawDate = frontmatter.date || new Date().toISOString();
  const date = new Date(rawDate);
  const publishedAt = Number.isNaN(date.getTime()) ? rawDate : date.toUTCString();
  const postUrl = `${siteBaseUrl.replace(/\/+$/, '')}/blog/${slug}`;
  const marker = `[blog:${slug}]`;
  const campaignName = `${marker} ${title}`;

  const existing = await findExistingCampaignByMarker({ baseUrl, authHeader, marker });
  if (existing) {
    return {
      status: 'exists',
      slug,
      postFile,
      campaignId: existing.id,
      campaignName: existing.name,
      reason: 'Campaign already exists for this post slug',
    };
  }

  const payload = {
    name: campaignName,
    subject: `New on HelmForge: ${title}`,
    lists: listIds,
    type: 'regular',
    content_type: 'html',
    body: buildCampaignHtml({ title, description, postUrl, publishedAt }),
    messenger: 'email',
    tags: ['blog-auto', `slug:${slug}`],
    ...(templateId ? { template_id: templateId } : {}),
  };

  if (dryRun) {
    return { status: 'dry-run', slug, postFile, payload };
  }

  const created = await apiRequest({
    baseUrl,
    authHeader,
    method: 'POST',
    endpoint: '/api/campaigns',
    body: payload,
  });

  return {
    status: 'created',
    slug,
    postFile,
    campaignId: created?.data?.id,
    campaignName: created?.data?.name,
  };
}

async function main() {
  const postFiles = normalizePostFiles();
  if (postFiles.length === 0) {
    console.log('No blog post files received. Nothing to do.');
    return;
  }

  const baseUrl = requireEnv('LISTMONK_BASE_URL').replace(/\/+$/, '');
  const apiUser = requireEnv('LISTMONK_API_USER');
  const apiToken = requireEnv('LISTMONK_API_TOKEN');
  const listIds = requireEnv('LISTMONK_LIST_ID')
    .split(',')
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (listIds.length === 0) {
    throw new Error('LISTMONK_LIST_ID is invalid. Provide numeric list id(s), comma-separated if multiple.');
  }

  const templateIdRaw = process.env.LISTMONK_TEMPLATE_ID?.trim();
  const templateId = templateIdRaw && /^[0-9]+$/.test(templateIdRaw) ? Number(templateIdRaw) : null;
  const siteBaseUrl = (process.env.SITE_BASE_URL || 'https://helmforge.dev').trim();
  const dryRun = parseBoolean(process.env.DRY_RUN, false);
  const authHeader = `Basic ${Buffer.from(`${apiUser}:${apiToken}`).toString('base64')}`;

  const results = [];
  for (const postFile of postFiles) {
    const result = await processPost({
      postFile,
      baseUrl,
      authHeader,
      siteBaseUrl,
      listIds,
      templateId,
      dryRun,
    });
    results.push(result);
  }

  for (const result of results) {
    if (result.status === 'created') {
      console.log(`Created draft campaign #${result.campaignId} for ${result.slug}`);
    } else if (result.status === 'exists') {
      console.log(`Skipped ${result.slug}: existing campaign #${result.campaignId}`);
    } else if (result.status === 'skipped') {
      console.log(`Skipped ${result.slug}: ${result.reason}`);
    } else if (result.status === 'dry-run') {
      console.log(`Dry-run for ${result.slug}: payload prepared`);
    }
  }

  await appendSummary([
    '## Blog Newsletter Draft Automation',
    '',
    `- Dry run: \`${dryRun}\``,
    ...results.map((result) => {
      if (result.status === 'created') {
        return `- Created: \`${result.slug}\` -> campaign #${result.campaignId}`;
      }
      if (result.status === 'exists') {
        return `- Exists: \`${result.slug}\` -> campaign #${result.campaignId} (skipped)`;
      }
      if (result.status === 'skipped') {
        return `- Skipped: \`${result.slug}\` (${result.reason})`;
      }
      return `- Dry-run prepared: \`${result.slug}\``;
    }),
  ]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
