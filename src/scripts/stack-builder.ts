const checkboxes = document.querySelectorAll<HTMLInputElement>('.stack-checkbox');
const codeEl = document.getElementById('stack-code');
const countEl = document.getElementById('stack-count');
const copyBtn = document.getElementById('stack-copy-btn') as HTMLButtonElement | null;
const hintEl = document.getElementById('stack-empty-hint');
const searchInput = document.getElementById('stack-search') as HTMLInputElement | null;
const chartItems = document.querySelectorAll<HTMLElement>('.stack-chart-item');
const presets = document.querySelectorAll<HTMLButtonElement>('.stack-preset');

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

function generateScript(charts: { name: string; slug: string }[]): string {
  if (charts.length === 0) {
    return '<span class="text-zinc-500"># Select charts on the left to generate your install script</span>\n<span class="text-zinc-500"># Commands will appear here automatically</span>';
  }

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

function getPlainScript(charts: { name: string; slug: string }[]): string {
  if (charts.length === 0) return '';
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

function update() {
  const selected = getSelected();
  if (codeEl) codeEl.innerHTML = generateScript(selected);
  if (countEl) countEl.textContent = `${selected.length} selected`;
  if (copyBtn) copyBtn.disabled = selected.length === 0;
  if (hintEl) hintEl.style.display = selected.length > 0 ? 'none' : '';

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

checkboxes.forEach((cb) => cb.addEventListener('change', update));

// Copy
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    const selected = getSelected();
    const text = getPlainScript(selected);
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
