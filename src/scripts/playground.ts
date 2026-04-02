interface FieldConfig {
  label: string;
  key: string;
  type: 'text' | 'number' | 'select' | 'toggle';
  default: string;
  options?: string[];
  description: string;
}

const configs: Record<string, FieldConfig[]> = (window as any).__playgroundConfigs ?? {};

const chartBtns = document.querySelectorAll<HTMLButtonElement>('.playground-chart-btn');
const emptyEl = document.getElementById('playground-empty');
const fieldsEl = document.getElementById('playground-fields');
const controlsEl = document.getElementById('playground-controls');
const titleEl = document.getElementById('playground-chart-title');
const docsLink = document.getElementById('playground-docs-link') as HTMLAnchorElement | null;
const codeEl = document.getElementById('playground-code');
const copyBtn = document.getElementById('playground-copy') as HTMLButtonElement | null;

let selectedSlug = '';
let currentValues: Record<string, string> = {};

function getFields(slug: string): FieldConfig[] {
  return configs[slug] ?? configs['_default'] ?? [];
}

function selectChart(slug: string, name: string) {
  selectedSlug = slug;
  currentValues = {};

  // Update button states
  chartBtns.forEach((btn) => {
    if (btn.dataset.slug === slug) {
      btn.classList.add('border-primary/60', 'bg-primary/5');
    } else {
      btn.classList.remove('border-primary/60', 'bg-primary/5');
    }
  });

  // Show config
  if (emptyEl) emptyEl.classList.add('hidden');
  if (fieldsEl) fieldsEl.classList.remove('hidden');
  if (titleEl) titleEl.textContent = name;
  if (docsLink) docsLink.href = `/docs/charts/${slug}`;

  // Build controls
  const fields = getFields(slug);
  if (!controlsEl) return;
  controlsEl.innerHTML = '';

  fields.forEach((field) => {
    currentValues[field.key] = field.default;
    const div = document.createElement('div');
    div.className = 'flex items-center justify-between gap-4';

    const labelDiv = document.createElement('div');
    labelDiv.className = 'min-w-0';
    labelDiv.innerHTML = `
      <div class="text-sm font-semibold text-text-base">${field.label}</div>
      <div class="text-xs text-text-muted">${field.description}</div>
    `;

    const controlDiv = document.createElement('div');
    controlDiv.className = 'shrink-0';

    if (field.type === 'select') {
      const select = document.createElement('select');
      select.className =
        'rounded-lg border border-border bg-bg-surface/80 px-3 py-1.5 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-primary-light';
      (field.options ?? []).forEach((opt) => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        if (opt === field.default) option.selected = true;
        select.appendChild(option);
      });
      select.addEventListener('change', () => {
        currentValues[field.key] = select.value;
        updateOutput();
      });
      controlDiv.appendChild(select);
    } else if (field.type === 'toggle') {
      const btn = document.createElement('button');
      btn.className = `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${field.default === 'true' ? 'bg-primary' : 'bg-border'}`;
      btn.innerHTML = `<span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${field.default === 'true' ? 'translate-x-6' : 'translate-x-1'}"></span>`;
      btn.addEventListener('click', () => {
        const isOn = currentValues[field.key] === 'true';
        currentValues[field.key] = isOn ? 'false' : 'true';
        btn.className = `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!isOn ? 'bg-primary' : 'bg-border'}`;
        const dot = btn.querySelector('span')!;
        dot.className = `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${!isOn ? 'translate-x-6' : 'translate-x-1'}`;
        updateOutput();
      });
      controlDiv.appendChild(btn);
    } else if (field.type === 'number') {
      const input = document.createElement('input');
      input.type = 'number';
      input.min = '1';
      input.max = '10';
      input.value = field.default;
      input.className =
        'w-20 rounded-lg border border-border bg-bg-surface/80 px-3 py-1.5 text-sm text-text-base text-center focus:outline-none focus:ring-2 focus:ring-primary-light';
      input.addEventListener('input', () => {
        currentValues[field.key] = input.value;
        updateOutput();
      });
      controlDiv.appendChild(input);
    } else {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = field.default;
      input.className =
        'w-28 rounded-lg border border-border bg-bg-surface/80 px-3 py-1.5 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-primary-light';
      input.addEventListener('input', () => {
        currentValues[field.key] = input.value;
        updateOutput();
      });
      controlDiv.appendChild(input);
    }

    div.appendChild(labelDiv);
    div.appendChild(controlDiv);
    controlsEl.appendChild(div);
  });

  updateOutput();
}

function buildSetFlags(): string[] {
  const fields = getFields(selectedSlug);
  const flags: string[] = [];
  fields.forEach((field) => {
    const val = currentValues[field.key];
    if (val !== field.default) {
      flags.push(`--set ${field.key}=${val}`);
    }
  });
  return flags;
}

function updateOutput() {
  if (!codeEl || !selectedSlug) return;
  if (copyBtn) copyBtn.disabled = false;

  const flags = buildSetFlags();
  const lines: string[] = [];

  lines.push(`<span class="text-emerald-400">helm</span> install ${selectedSlug} helmforge/${selectedSlug} \\`);
  lines.push(`  --namespace helmforge \\`);

  flags.forEach((flag) => {
    lines.push(`  ${flag} \\`);
  });

  lines.push(`  --wait --timeout 5m`);

  codeEl.innerHTML = lines.join('\n');
}

function getPlainCommand(): string {
  const flags = buildSetFlags();
  const parts = [`helm install ${selectedSlug} helmforge/${selectedSlug}`, '  --namespace helmforge'];
  flags.forEach((f) => parts.push(`  ${f}`));
  parts.push('  --wait --timeout 5m');
  return parts.join(' \\\n');
}

// Event listeners
chartBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    selectChart(btn.dataset.slug ?? '', btn.dataset.name ?? '');
  });
});

if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    if (!selectedSlug) return;
    try {
      await navigator.clipboard.writeText(getPlainCommand());
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy to clipboard'), 2000);
    } catch {
      // Fallback
    }
  });
}
