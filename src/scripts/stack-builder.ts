// SPDX-License-Identifier: Apache-2.0
const checkboxes = document.querySelectorAll<HTMLInputElement>('.stack-checkbox');
const codeEl = document.getElementById('stack-code');
const countEl = document.getElementById('stack-count');
const copyBtn = document.getElementById('stack-copy-btn') as HTMLButtonElement | null;
const downloadBtn = document.getElementById('stack-download-btn') as HTMLButtonElement | null;
const clearBtn = document.getElementById('stack-clear-btn') as HTMLButtonElement | null;
const hintEl = document.getElementById('stack-empty-hint');
const searchInput = document.getElementById('stack-search') as HTMLInputElement | null;
const chartItems = document.querySelectorAll<HTMLElement>('.stack-chart-item');
const presets = document.querySelectorAll<HTMLButtonElement>('.stack-preset');
const formatBtns = document.querySelectorAll<HTMLButtonElement>('.stack-format-btn');
const filenameEl = document.getElementById('stack-filename');
const categoryPills = document.querySelectorAll<HTMLButtonElement>('.stack-cat-filter');
const playgroundLinksEl = document.getElementById('stack-playground-links');

export type Format = 'bash' | 'oci' | 'helmfile' | 'argocd' | 'fluxcd';
let currentFormat: Format = 'bash';
let activeCategory = 'all';

const filenames: Record<Format, string> = {
  bash: 'stack-builder.sh',
  oci: 'stack-oci-install.sh',
  helmfile: 'helmfile.yaml',
  argocd: 'applications.yaml',
  fluxcd: 'flux-releases.yaml',
};

function getSelected(): { name: string; slug: string; category?: string }[] {
  const selected: { name: string; slug: string; category?: string }[] = [];
  checkboxes.forEach((cb) => {
    if (cb.checked) {
      selected.push({
        name: cb.dataset.chartName ?? cb.value,
        slug: cb.dataset.chartSlug ?? cb.value,
        category: cb.dataset.chartCategory,
      });
    }
  });
  return selected;
}

// --- 1. Bash (Helm Repository) ---
function generateBash(charts: { name: string; slug: string }[]): string {
  const lines: string[] = [];
  lines.push('<span class="text-zinc-400">#!/usr/bin/env bash</span>');
  lines.push('<span class="text-zinc-400"># HelmForge Stack — Generated at helmforge.dev/stack</span>');
  lines.push('<span class="text-zinc-400">set -euo pipefail</span>');
  lines.push('');
  lines.push('<span class="text-zinc-400"># 1. Add HelmForge HTTPS repository</span>');
  lines.push('<span class="text-emerald-400">helm</span> repo add helmforge https://repo.helmforge.dev');
  lines.push('<span class="text-emerald-400">helm</span> repo update');
  lines.push('');
  lines.push('<span class="text-zinc-400"># 2. Create target namespace</span>');
  lines.push(
    '<span class="text-emerald-400">kubectl</span> create namespace helmforge --dry-run=client -o yaml | <span class="text-emerald-400">kubectl</span> apply -f -',
  );
  lines.push('');
  lines.push('<span class="text-zinc-400"># 3. Install stack charts in production namespace</span>');

  charts.forEach((chart) => {
    lines.push(`<span class="text-emerald-400">helm</span> install ${chart.slug} helmforge/${chart.slug} \\`);
    lines.push(`  --namespace helmforge \\`);
    lines.push(`  --create-namespace \\`);
    lines.push(`  --wait --timeout 5m`);
    lines.push('');
  });

  lines.push(
    '<span class="text-emerald-400">echo</span> <span class="text-amber-300">"✓ HelmForge Stack successfully deployed!"</span>',
  );
  return lines.join('\n');
}

function getPlainBash(charts: { name: string; slug: string }[]): string {
  const lines: string[] = [];
  lines.push('#!/usr/bin/env bash');
  lines.push('# HelmForge Stack — Generated at helmforge.dev/stack');
  lines.push('set -euo pipefail');
  lines.push('');
  lines.push('# 1. Add HelmForge HTTPS repository');
  lines.push('helm repo add helmforge https://repo.helmforge.dev');
  lines.push('helm repo update');
  lines.push('');
  lines.push('# 2. Create target namespace');
  lines.push('kubectl create namespace helmforge --dry-run=client -o yaml | kubectl apply -f -');
  lines.push('');
  lines.push('# 3. Install stack charts in production namespace');

  charts.forEach((chart) => {
    lines.push(`helm install ${chart.slug} helmforge/${chart.slug} \\`);
    lines.push(`  --namespace helmforge \\`);
    lines.push(`  --create-namespace \\`);
    lines.push(`  --wait --timeout 5m`);
    lines.push('');
  });

  lines.push('echo "✓ HelmForge Stack successfully deployed!"');
  return lines.join('\n');
}

// --- 2. Bash (Helm OCI Registry) ---
function generateOci(charts: { name: string; slug: string }[]): string {
  const lines: string[] = [];
  lines.push('<span class="text-zinc-400">#!/usr/bin/env bash</span>');
  lines.push('<span class="text-zinc-400"># HelmForge OCI Stack — Generated at helmforge.dev/stack</span>');
  lines.push('<span class="text-zinc-400">set -euo pipefail</span>');
  lines.push('');
  lines.push('<span class="text-zinc-400"># Create target namespace</span>');
  lines.push(
    '<span class="text-emerald-400">kubectl</span> create namespace helmforge --dry-run=client -o yaml | <span class="text-emerald-400">kubectl</span> apply -f -',
  );
  lines.push('');
  lines.push('<span class="text-zinc-400"># Install charts directly from GitHub Container Registry (OCI)</span>');

  charts.forEach((chart) => {
    lines.push(
      `<span class="text-emerald-400">helm</span> install ${chart.slug} oci://ghcr.io/helmforgedev/helm/${chart.slug} \\`,
    );
    lines.push(`  --namespace helmforge \\`);
    lines.push(`  --create-namespace \\`);
    lines.push(`  --wait --timeout 5m`);
    lines.push('');
  });

  lines.push(
    '<span class="text-emerald-400">echo</span> <span class="text-amber-300">"✓ HelmForge OCI Stack deployed!"</span>',
  );
  return lines.join('\n');
}

function getPlainOci(charts: { name: string; slug: string }[]): string {
  const lines: string[] = [];
  lines.push('#!/usr/bin/env bash');
  lines.push('# HelmForge OCI Stack — Generated at helmforge.dev/stack');
  lines.push('set -euo pipefail');
  lines.push('');
  lines.push('# Create target namespace');
  lines.push('kubectl create namespace helmforge --dry-run=client -o yaml | kubectl apply -f -');
  lines.push('');
  lines.push('# Install charts directly from GitHub Container Registry (OCI)');

  charts.forEach((chart) => {
    lines.push(`helm install ${chart.slug} oci://ghcr.io/helmforgedev/helm/${chart.slug} \\`);
    lines.push(`  --namespace helmforge \\`);
    lines.push(`  --create-namespace \\`);
    lines.push(`  --wait --timeout 5m`);
    lines.push('');
  });

  lines.push('echo "✓ HelmForge OCI Stack deployed!"');
  return lines.join('\n');
}

// --- 3. Helmfile format ---
function generateHelmfile(charts: { name: string; slug: string }[]): string {
  const lines: string[] = [];
  lines.push('<span class="text-zinc-400"># helmfile.yaml — generated at helmforge.dev/stack</span>');
  lines.push('<span class="text-sky-400">repositories</span>:');
  lines.push('  - <span class="text-sky-400">name</span>: helmforge');
  lines.push('    <span class="text-sky-400">url</span>: https://repo.helmforge.dev');
  lines.push('');
  lines.push('<span class="text-sky-400">releases</span>:');

  charts.forEach((chart) => {
    lines.push(`  - <span class="text-sky-400">name</span>: ${chart.slug}`);
    lines.push(`    <span class="text-sky-400">namespace</span>: helmforge`);
    lines.push(`    <span class="text-sky-400">chart</span>: helmforge/${chart.slug}`);
    lines.push(`    <span class="text-sky-400">installed</span>: <span class="text-amber-300">true</span>`);
    lines.push(`    <span class="text-sky-400">wait</span>: <span class="text-amber-300">true</span>`);
    lines.push(`    <span class="text-sky-400">timeout</span>: <span class="text-amber-300">300</span>`);
    lines.push('');
  });

  return lines.join('\n');
}

function getPlainHelmfile(charts: { name: string; slug: string }[]): string {
  const lines: string[] = [];
  lines.push('# helmfile.yaml — generated at helmforge.dev/stack');
  lines.push('repositories:');
  lines.push('  - name: helmforge');
  lines.push('    url: https://repo.helmforge.dev');
  lines.push('');
  lines.push('releases:');

  charts.forEach((chart) => {
    lines.push(`  - name: ${chart.slug}`);
    lines.push(`    namespace: helmforge`);
    lines.push(`    chart: helmforge/${chart.slug}`);
    lines.push(`    installed: true`);
    lines.push(`    wait: true`);
    lines.push(`    timeout: 300`);
    lines.push('');
  });

  return lines.join('\n');
}

// --- 4. ArgoCD format ---
function generateArgoCD(charts: { name: string; slug: string }[]): string {
  const lines: string[] = [];
  lines.push('<span class="text-zinc-400"># ArgoCD Applications — generated at helmforge.dev/stack</span>');

  charts.forEach((chart, i) => {
    if (i > 0) lines.push('<span class="text-zinc-400">---</span>');
    lines.push('<span class="text-sky-400">apiVersion</span>: argoproj.io/v1alpha1');
    lines.push('<span class="text-sky-400">kind</span>: Application');
    lines.push('<span class="text-sky-400">metadata</span>:');
    lines.push(`  <span class="text-sky-400">name</span>: ${chart.slug}`);
    lines.push('  <span class="text-sky-400">namespace</span>: argocd');
    lines.push('  <span class="text-sky-400">finalizers</span>:');
    lines.push('    - resources-finalizer.argocd.argoproj.io');
    lines.push('<span class="text-sky-400">spec</span>:');
    lines.push('  <span class="text-sky-400">project</span>: default');
    lines.push('  <span class="text-sky-400">source</span>:');
    lines.push('    <span class="text-sky-400">repoURL</span>: https://repo.helmforge.dev');
    lines.push(`    <span class="text-sky-400">chart</span>: ${chart.slug}`);
    lines.push(`    <span class="text-sky-400">targetRevision</span>: <span class="text-amber-300">"*"</span>`);
    lines.push('  <span class="text-sky-400">destination</span>:');
    lines.push('    <span class="text-sky-400">server</span>: https://kubernetes.default.svc');
    lines.push('    <span class="text-sky-400">namespace</span>: helmforge');
    lines.push('  <span class="text-sky-400">syncPolicy</span>:');
    lines.push('    <span class="text-sky-400">automated</span>:');
    lines.push('      <span class="text-sky-400">selfHeal</span>: <span class="text-amber-300">true</span>');
    lines.push('      <span class="text-sky-400">prune</span>: <span class="text-amber-300">true</span>');
    lines.push('    <span class="text-sky-400">syncOptions</span>:');
    lines.push('      - CreateNamespace=true');
    lines.push('');
  });

  return lines.join('\n');
}

function getPlainArgoCD(charts: { name: string; slug: string }[]): string {
  const lines: string[] = [];
  lines.push('# ArgoCD Applications — generated at helmforge.dev/stack');

  charts.forEach((chart, i) => {
    if (i > 0) lines.push('---');
    lines.push('apiVersion: argoproj.io/v1alpha1');
    lines.push('kind: Application');
    lines.push('metadata:');
    lines.push(`  name: ${chart.slug}`);
    lines.push('  namespace: argocd');
    lines.push('  finalizers:');
    lines.push('    - resources-finalizer.argocd.argoproj.io');
    lines.push('spec:');
    lines.push('  project: default');
    lines.push('  source:');
    lines.push('    repoURL: https://repo.helmforge.dev');
    lines.push(`    chart: ${chart.slug}`);
    lines.push('    targetRevision: "*"');
    lines.push('  destination:');
    lines.push('    server: https://kubernetes.default.svc');
    lines.push('    namespace: helmforge');
    lines.push('  syncPolicy:');
    lines.push('    automated:');
    lines.push('      selfHeal: true');
    lines.push('      prune: true');
    lines.push('    syncOptions:');
    lines.push('      - CreateNamespace=true');
    lines.push('');
  });

  return lines.join('\n');
}

// --- 5. FluxCD format ---
function generateFluxCD(charts: { name: string; slug: string }[]): string {
  const lines: string[] = [];
  lines.push('<span class="text-zinc-400"># FluxCD GitOps Manifests — generated at helmforge.dev/stack</span>');
  lines.push('<span class="text-sky-400">apiVersion</span>: source.toolkit.fluxcd.io/v1');
  lines.push('<span class="text-sky-400">kind</span>: HelmRepository');
  lines.push('<span class="text-sky-400">metadata</span>:');
  lines.push('  <span class="text-sky-400">name</span>: helmforge');
  lines.push('  <span class="text-sky-400">namespace</span>: flux-system');
  lines.push('<span class="text-sky-400">spec</span>:');
  lines.push('  <span class="text-sky-400">interval</span>: 1h');
  lines.push('  <span class="text-sky-400">url</span>: https://repo.helmforge.dev');

  charts.forEach((chart) => {
    lines.push('<span class="text-zinc-400">---</span>');
    lines.push('<span class="text-sky-400">apiVersion</span>: helm.toolkit.fluxcd.io/v2');
    lines.push('<span class="text-sky-400">kind</span>: HelmRelease');
    lines.push('<span class="text-sky-400">metadata</span>:');
    lines.push(`  <span class="text-sky-400">name</span>: ${chart.slug}`);
    lines.push('  <span class="text-sky-400">namespace</span>: helmforge');
    lines.push('<span class="text-sky-400">spec</span>:');
    lines.push('  <span class="text-sky-400">interval</span>: 30m');
    lines.push('  <span class="text-sky-400">chart</span>:');
    lines.push('    <span class="text-sky-400">spec</span>:');
    lines.push(`      <span class="text-sky-400">chart</span>: ${chart.slug}`);
    lines.push(`      <span class="text-sky-400">version</span>: <span class="text-amber-300">"*"</span>`);
    lines.push('      <span class="text-sky-400">sourceRef</span>:');
    lines.push('        <span class="text-sky-400">kind</span>: HelmRepository');
    lines.push('        <span class="text-sky-400">name</span>: helmforge');
    lines.push('        <span class="text-sky-400">namespace</span>: flux-system');
    lines.push('  <span class="text-sky-400">install</span>:');
    lines.push('    <span class="text-sky-400">createNamespace</span>: <span class="text-amber-300">true</span>');
    lines.push('    <span class="text-sky-400">remediation</span>:');
    lines.push('      <span class="text-sky-400">retries</span>: <span class="text-amber-300">3</span>');
    lines.push('');
  });

  return lines.join('\n');
}

function getPlainFluxCD(charts: { name: string; slug: string }[]): string {
  const lines: string[] = [];
  lines.push('# FluxCD GitOps Manifests — generated at helmforge.dev/stack');
  lines.push('apiVersion: source.toolkit.fluxcd.io/v1');
  lines.push('kind: HelmRepository');
  lines.push('metadata:');
  lines.push('  name: helmforge');
  lines.push('  namespace: flux-system');
  lines.push('spec:');
  lines.push('  interval: 1h');
  lines.push('  url: https://repo.helmforge.dev');

  charts.forEach((chart) => {
    lines.push('---');
    lines.push('apiVersion: helm.toolkit.fluxcd.io/v2');
    lines.push('kind: HelmRelease');
    lines.push('metadata:');
    lines.push(`  name: ${chart.slug}`);
    lines.push('  namespace: helmforge');
    lines.push('spec:');
    lines.push('  interval: 30m');
    lines.push('  chart:');
    lines.push('    spec:');
    lines.push(`      chart: ${chart.slug}`);
    lines.push('      version: "*"');
    lines.push('      sourceRef:');
    lines.push('        kind: HelmRepository');
    lines.push('        name: helmforge');
    lines.push('        namespace: flux-system');
    lines.push('  install:');
    lines.push('    createNamespace: true');
    lines.push('    remediation:');
    lines.push('      retries: 3');
    lines.push('');
  });

  return lines.join('\n');
}

// --- Generators Map ---
const generators: Record<Format, (c: { name: string; slug: string }[]) => string> = {
  bash: generateBash,
  oci: generateOci,
  helmfile: generateHelmfile,
  argocd: generateArgoCD,
  fluxcd: generateFluxCD,
};

const plainGenerators: Record<Format, (c: { name: string; slug: string }[]) => string> = {
  bash: getPlainBash,
  oci: getPlainOci,
  helmfile: getPlainHelmfile,
  argocd: getPlainArgoCD,
  fluxcd: getPlainFluxCD,
};

const emptyMessages: Record<Format, string> = {
  bash: '<span class="text-zinc-400"># Select charts on the left to generate your install script</span>\n<span class="text-zinc-400"># Commands will appear here automatically</span>',
  oci: '<span class="text-zinc-400"># Select charts on the left to generate OCI install commands</span>\n<span class="text-zinc-400"># Commands will appear here automatically</span>',
  helmfile:
    '<span class="text-zinc-400"># Select charts on the left to generate helmfile.yaml</span>\n<span class="text-zinc-400"># YAML will appear here automatically</span>',
  argocd:
    '<span class="text-zinc-400"># Select charts on the left to generate ArgoCD Applications</span>\n<span class="text-zinc-400"># Manifests will appear here automatically</span>',
  fluxcd:
    '<span class="text-zinc-400"># Select charts on the left to generate FluxCD HelmReleases</span>\n<span class="text-zinc-400"># Manifests will appear here automatically</span>',
};

function update() {
  const selected = getSelected();
  if (codeEl) {
    codeEl.innerHTML = selected.length > 0 ? generators[currentFormat](selected) : emptyMessages[currentFormat];
  }
  if (countEl) countEl.textContent = `${selected.length} selected`;
  if (copyBtn) copyBtn.disabled = selected.length === 0;
  if (downloadBtn) downloadBtn.disabled = selected.length === 0;
  if (clearBtn) clearBtn.style.display = selected.length > 0 ? 'inline-flex' : 'none';
  if (hintEl) hintEl.style.display = selected.length > 0 ? 'none' : '';
  if (filenameEl) filenameEl.textContent = filenames[currentFormat];

  // Update check icons and selection styling
  checkboxes.forEach((cb) => {
    const label = cb.closest('label');
    if (!label) return;
    const icon = label.querySelector('.stack-check-icon');
    const svg = icon?.querySelector('svg');
    if (!icon || !svg) return;
    if (cb.checked) {
      icon.classList.add('bg-primary', 'border-primary');
      icon.classList.remove('border-border');
      svg.classList.remove('hidden');
    } else {
      icon.classList.remove('bg-primary', 'border-primary');
      icon.classList.add('border-border');
      svg.classList.add('hidden');
    }
  });

  // Update "Open in Playground" quick links
  if (playgroundLinksEl) {
    if (selected.length > 0) {
      playgroundLinksEl.style.display = 'block';
      playgroundLinksEl.innerHTML = `
        <div class="flex flex-wrap items-center gap-1.5 pt-3 border-t border-border/60">
          <span class="text-xs text-text-muted font-medium">Customize in Studio:</span>
          ${selected
            .map(
              (c) =>
                `<a href="/playground?chart=${c.slug}" target="_blank" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/10 text-primary-light hover:bg-primary/20 transition-colors">
                  ${c.name} ↗
                </a>`,
            )
            .join('')}
        </div>
      `;
    } else {
      playgroundLinksEl.style.display = 'none';
      playgroundLinksEl.innerHTML = '';
    }
  }
}

// Format toggle
formatBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    currentFormat = (btn.dataset.format as Format) ?? 'bash';
    formatBtns.forEach((b) => {
      if (b === btn) {
        b.classList.add('bg-primary', 'text-white');
        b.classList.remove('text-text-muted');
      } else {
        b.classList.remove('bg-primary', 'text-white');
        b.classList.add('text-text-muted');
      }
    });
    update();
  });
});

checkboxes.forEach((cb) => {
  cb.addEventListener('change', update);
  // Prevent sr-only checkbox focus from scrolling the page
  cb.addEventListener('focus', () => {
    const scrollY = window.scrollY;
    requestAnimationFrame(() => {
      if (window.scrollY !== scrollY) {
        window.scrollTo({ top: scrollY });
      }
    });
  });
});

// Copy to clipboard
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    const selected = getSelected();
    const text = plainGenerators[currentFormat](selected);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = originalText), 2000);
    } catch {
      // Fallback
    }
  });
}

// Download file directly
if (downloadBtn) {
  downloadBtn.addEventListener('click', () => {
    const selected = getSelected();
    const text = plainGenerators[currentFormat](selected);
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filenames[currentFormat];
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

// Clear all selection
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    checkboxes.forEach((cb) => {
      cb.checked = false;
    });
    update();
  });
}

// Search and Category filtering
function filterCharts() {
  const term = searchInput?.value.toLowerCase().trim() || '';
  chartItems.forEach((item) => {
    const name = item.dataset.name?.toLowerCase() || '';
    const category = item.dataset.category?.toLowerCase() || '';
    const matchesSearch = !term || name.includes(term);
    const matchesCategory = activeCategory === 'all' || category === activeCategory;

    item.style.display = matchesSearch && matchesCategory ? '' : 'none';
  });
}

if (searchInput) {
  searchInput.addEventListener('input', filterCharts);
}

categoryPills.forEach((pill) => {
  pill.addEventListener('click', () => {
    activeCategory = pill.dataset.category || 'all';
    categoryPills.forEach((p) => {
      if (p === pill) {
        p.classList.add('bg-primary/20', 'text-primary-light', 'border-primary/40');
        p.classList.remove('bg-bg-surface/60', 'text-text-muted', 'border-border');
      } else {
        p.classList.remove('bg-primary/20', 'text-primary-light', 'border-primary/40');
        p.classList.add('bg-bg-surface/60', 'text-text-muted', 'border-border');
      }
    });
    filterCharts();
  });
});

// Preset stacks
presets.forEach((preset) => {
  preset.addEventListener('click', () => {
    const slugs = (preset.dataset.charts ?? '').split(',').map((s) => s.trim());
    checkboxes.forEach((cb) => {
      cb.checked = slugs.includes(cb.value);
    });
    update();
  });
});
