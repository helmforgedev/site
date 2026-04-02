const checkboxes = document.querySelectorAll<HTMLInputElement>('.stack-checkbox');
const codeEl = document.getElementById('stack-code');
const countEl = document.getElementById('stack-count');
const copyBtn = document.getElementById('stack-copy-btn') as HTMLButtonElement | null;
const hintEl = document.getElementById('stack-empty-hint');
const searchInput = document.getElementById('stack-search') as HTMLInputElement | null;
const chartItems = document.querySelectorAll<HTMLElement>('.stack-chart-item');
const presets = document.querySelectorAll<HTMLButtonElement>('.stack-preset');
const formatBtns = document.querySelectorAll<HTMLButtonElement>('.stack-format-btn');
const filenameEl = document.getElementById('stack-filename');

type Format = 'bash' | 'helmfile' | 'argocd';
let currentFormat: Format = 'bash';

const filenames: Record<Format, string> = {
  bash: 'stack-builder.sh',
  helmfile: 'helmfile.yaml',
  argocd: 'applications.yaml',
};

function getSelected(): { name: string; slug: string }[] {
  const selected: { name: string; slug: string }[] = [];
  checkboxes.forEach((cb) => {
    if (cb.checked) {
      selected.push({
        name: cb.dataset.chartName ?? cb.value,
        slug: cb.dataset.chartSlug ?? cb.value,
      });
    }
  });
  return selected;
}

// --- Bash format ---
function generateBash(charts: { name: string; slug: string }[]): string {
  const lines: string[] = [];
  lines.push('<span class="text-zinc-500">#!/bin/bash</span>');
  lines.push('<span class="text-zinc-500"># HelmForge Stack — generated at helmforge.dev/stack</span>');
  lines.push('');
  lines.push('<span class="text-zinc-500"># Add the HelmForge repository</span>');
  lines.push('<span class="text-emerald-400">helm</span> repo add helmforge https://repo.helmforge.dev');
  lines.push('<span class="text-emerald-400">helm</span> repo update');
  lines.push('');
  lines.push('<span class="text-zinc-500"># Create namespace</span>');
  lines.push(
    '<span class="text-emerald-400">kubectl</span> create namespace helmforge --dry-run=client -o yaml | <span class="text-emerald-400">kubectl</span> apply -f -',
  );
  lines.push('');
  lines.push('<span class="text-zinc-500"># Install charts</span>');

  charts.forEach((chart) => {
    lines.push(`<span class="text-emerald-400">helm</span> install ${chart.slug} helmforge/${chart.slug} \\`);
    lines.push(`  --namespace helmforge \\`);
    lines.push(`  --wait --timeout 5m`);
    lines.push('');
  });

  lines.push(
    '<span class="text-emerald-400">echo</span> <span class="text-amber-300">"Stack deployed successfully!"</span>',
  );
  return lines.join('\n');
}

function getPlainBash(charts: { name: string; slug: string }[]): string {
  const lines: string[] = [];
  lines.push('#!/bin/bash');
  lines.push('# HelmForge Stack — generated at helmforge.dev/stack');
  lines.push('');
  lines.push('# Add the HelmForge repository');
  lines.push('helm repo add helmforge https://repo.helmforge.dev');
  lines.push('helm repo update');
  lines.push('');
  lines.push('# Create namespace');
  lines.push('kubectl create namespace helmforge --dry-run=client -o yaml | kubectl apply -f -');
  lines.push('');
  lines.push('# Install charts');

  charts.forEach((chart) => {
    lines.push(`helm install ${chart.slug} helmforge/${chart.slug} \\`);
    lines.push(`  --namespace helmforge \\`);
    lines.push(`  --wait --timeout 5m`);
    lines.push('');
  });

  lines.push('echo "Stack deployed successfully!"');
  return lines.join('\n');
}

// --- Helmfile format ---
function generateHelmfile(charts: { name: string; slug: string }[]): string {
  const lines: string[] = [];
  lines.push('<span class="text-zinc-500"># helmfile.yaml — generated at helmforge.dev/stack</span>');
  lines.push('<span class="text-sky-400">repositories</span>:');
  lines.push('  - <span class="text-sky-400">name</span>: helmforge');
  lines.push('    <span class="text-sky-400">url</span>: https://repo.helmforge.dev');
  lines.push('');
  lines.push('<span class="text-sky-400">releases</span>:');

  charts.forEach((chart) => {
    lines.push(`  - <span class="text-sky-400">name</span>: ${chart.slug}`);
    lines.push(`    <span class="text-sky-400">namespace</span>: helmforge`);
    lines.push(`    <span class="text-sky-400">chart</span>: helmforge/${chart.slug}`);
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
    lines.push(`    wait: true`);
    lines.push(`    timeout: 300`);
    lines.push('');
  });

  return lines.join('\n');
}

// --- ArgoCD format ---
function generateArgoCD(charts: { name: string; slug: string }[]): string {
  const lines: string[] = [];
  lines.push('<span class="text-zinc-500"># ArgoCD Applications — generated at helmforge.dev/stack</span>');

  charts.forEach((chart, i) => {
    if (i > 0) lines.push('<span class="text-zinc-500">---</span>');
    lines.push('<span class="text-sky-400">apiVersion</span>: argoproj.io/v1alpha1');
    lines.push('<span class="text-sky-400">kind</span>: Application');
    lines.push('<span class="text-sky-400">metadata</span>:');
    lines.push(`  <span class="text-sky-400">name</span>: ${chart.slug}`);
    lines.push('  <span class="text-sky-400">namespace</span>: argocd');
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
    lines.push('');
  });

  return lines.join('\n');
}

// --- Generators map ---
const generators: Record<Format, (c: { name: string; slug: string }[]) => string> = {
  bash: generateBash,
  helmfile: generateHelmfile,
  argocd: generateArgoCD,
};

const plainGenerators: Record<Format, (c: { name: string; slug: string }[]) => string> = {
  bash: getPlainBash,
  helmfile: getPlainHelmfile,
  argocd: getPlainArgoCD,
};

const emptyMessages: Record<Format, string> = {
  bash: '<span class="text-zinc-500"># Select charts on the left to generate your install script</span>\n<span class="text-zinc-500"># Commands will appear here automatically</span>',
  helmfile:
    '<span class="text-zinc-500"># Select charts on the left to generate helmfile.yaml</span>\n<span class="text-zinc-500"># YAML will appear here automatically</span>',
  argocd:
    '<span class="text-zinc-500"># Select charts on the left to generate ArgoCD Applications</span>\n<span class="text-zinc-500"># Manifests will appear here automatically</span>',
};

function update() {
  const selected = getSelected();
  if (codeEl) {
    codeEl.innerHTML = selected.length > 0 ? generators[currentFormat](selected) : emptyMessages[currentFormat];
  }
  if (countEl) countEl.textContent = `${selected.length} selected`;
  if (copyBtn) copyBtn.disabled = selected.length === 0;
  if (hintEl) hintEl.style.display = selected.length > 0 ? 'none' : '';
  if (filenameEl) filenameEl.textContent = filenames[currentFormat];

  // Update check icons
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

checkboxes.forEach((cb) => cb.addEventListener('change', update));

// Copy
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    const selected = getSelected();
    const text = plainGenerators[currentFormat](selected);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy to clipboard'), 2000);
    } catch {
      // Fallback
    }
  });
}

// Search filter
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase().trim();
    chartItems.forEach((item) => {
      const name = item.dataset.name ?? '';
      item.style.display = name.includes(term) ? '' : 'none';
    });
  });
}

// Preset stacks
presets.forEach((preset) => {
  preset.addEventListener('click', () => {
    const slugs = (preset.dataset.charts ?? '').split(',');
    checkboxes.forEach((cb) => {
      cb.checked = slugs.includes(cb.value);
    });
    update();
  });
});
