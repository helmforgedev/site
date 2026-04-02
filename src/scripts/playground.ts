interface FieldConfig {
  label: string;
  key: string;
  type: 'text' | 'number' | 'select' | 'toggle';
  default: string;
  options?: string[];
  description: string;
  group?: string;
}

interface Scenario {
  label: string;
  description: string;
  values: Record<string, string>;
}

const configs: Record<string, FieldConfig[]> = (window as any).__playgroundConfigs ?? {};
const scenarios: Record<string, Scenario[]> = (window as any).__playgroundScenarios ?? {};

const chartBtns = document.querySelectorAll<HTMLButtonElement>('.playground-chart-btn');
const chartItems = document.querySelectorAll<HTMLElement>('.playground-chart-btn');
const searchInput = document.getElementById('playground-search') as HTMLInputElement | null;
const emptyEl = document.getElementById('playground-empty');
const fieldsEl = document.getElementById('playground-fields');
const controlsEl = document.getElementById('playground-controls');
const titleEl = document.getElementById('playground-chart-title');
const docsLink = document.getElementById('playground-docs-link') as HTMLAnchorElement | null;
const codeEl = document.getElementById('playground-code');
const copyBtn = document.getElementById('playground-copy') as HTMLButtonElement | null;
const shareBtn = document.getElementById('playground-share') as HTMLButtonElement | null;
const scenariosEl = document.getElementById('playground-scenarios');
const scenarioBtnsEl = document.getElementById('playground-scenario-btns');
const outputBtns = document.querySelectorAll<HTMLButtonElement>('.playground-output-btn');
const filenameEl = document.getElementById('playground-filename');
const deployHint = document.getElementById('playground-deploy-hint');
const diffEl = document.getElementById('playground-diff');
const diffCountEl = document.getElementById('playground-diff-count');
const diffListEl = document.getElementById('playground-diff-list');

type OutputMode = 'helm' | 'values';
let outputMode: OutputMode = 'helm';
let selectedSlug = '';
let selectedName = '';
let currentValues: Record<string, string> = {};

function getFields(slug: string): FieldConfig[] {
  return configs[slug] ?? configs['_default'] ?? [];
}

function getScenarios(slug: string): Scenario[] {
  return scenarios[slug] ?? [];
}

// Group fields by their group property
function groupFields(fields: FieldConfig[]): Map<string, FieldConfig[]> {
  const groups = new Map<string, FieldConfig[]>();
  for (const field of fields) {
    const group = field.group ?? 'General';
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(field);
  }
  return groups;
}

function selectChart(slug: string, name: string) {
  selectedSlug = slug;
  selectedName = name;
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
  if (deployHint) deployHint.classList.remove('hidden');

  // Build scenario buttons
  const chartScenarios = getScenarios(slug);
  if (scenariosEl && scenarioBtnsEl) {
    if (chartScenarios.length > 0) {
      scenariosEl.classList.remove('hidden');
      scenarioBtnsEl.innerHTML = '';
      chartScenarios.forEach((scenario) => {
        const btn = document.createElement('button');
        btn.className =
          'playground-scenario-btn px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-bg-surface/60 text-text-muted transition-all hover:border-primary/40 hover:text-text-base';
        btn.textContent = scenario.label;
        btn.title = scenario.description;
        btn.addEventListener('click', () => applyScenario(scenario));
        scenarioBtnsEl.appendChild(btn);
      });
    } else {
      scenariosEl.classList.add('hidden');
    }
  }

  // Build controls grouped
  const fields = getFields(slug);
  if (!controlsEl) return;
  controlsEl.innerHTML = '';

  const groups = groupFields(fields);

  for (const [groupName, groupFields] of groups) {
    // Group header
    const groupHeader = document.createElement('div');
    groupHeader.className = 'text-xs font-bold uppercase tracking-[0.12em] text-text-muted mb-2';
    if (controlsEl.children.length > 0) {
      groupHeader.classList.add('mt-3', 'pt-3', 'border-t', 'border-border');
    }
    groupHeader.textContent = groupName;
    controlsEl.appendChild(groupHeader);

    // Fields
    for (const field of groupFields) {
      currentValues[field.key] = field.default;
      const div = document.createElement('div');
      div.className = 'flex items-center justify-between gap-4';
      div.dataset.fieldKey = field.key;

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
        select.dataset.fieldKey = field.key;
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
        const isOn = field.default === 'true';
        btn.className = `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isOn ? 'bg-primary' : 'bg-border'}`;
        btn.innerHTML = `<span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}"></span>`;
        btn.dataset.fieldKey = field.key;
        btn.addEventListener('click', () => {
          const wasOn = currentValues[field.key] === 'true';
          currentValues[field.key] = wasOn ? 'false' : 'true';
          btn.className = `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!wasOn ? 'bg-primary' : 'bg-border'}`;
          const dot = btn.querySelector('span')!;
          dot.className = `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${!wasOn ? 'translate-x-6' : 'translate-x-1'}`;
          updateOutput();
        });
        controlDiv.appendChild(btn);
      } else if (field.type === 'number') {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '1';
        input.max = '10';
        input.value = field.default;
        input.dataset.fieldKey = field.key;
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
        input.dataset.fieldKey = field.key;
        input.className =
          'w-32 rounded-lg border border-border bg-bg-surface/80 px-3 py-1.5 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-primary-light';
        input.addEventListener('input', () => {
          currentValues[field.key] = input.value;
          updateOutput();
        });
        controlDiv.appendChild(input);
      }

      div.appendChild(labelDiv);
      div.appendChild(controlDiv);
      controlsEl.appendChild(div);
    }
  }

  updateOutput();
  updateUrlState();
}

function applyScenario(scenario: Scenario) {
  const fields = getFields(selectedSlug);

  // Reset all to defaults first
  fields.forEach((f) => {
    currentValues[f.key] = f.default;
  });

  // Apply scenario values
  for (const [key, val] of Object.entries(scenario.values)) {
    currentValues[key] = val;
  }

  // Update all UI controls to match
  if (controlsEl) {
    const controls = controlsEl.querySelectorAll<HTMLElement>('[data-field-key]');
    controls.forEach((el) => {
      const key = el.dataset.fieldKey ?? '';
      const val = currentValues[key];
      if (val === undefined) return;

      if (el instanceof HTMLSelectElement) {
        el.value = val;
      } else if (el instanceof HTMLInputElement) {
        el.value = val;
      } else if (el.tagName === 'BUTTON' && el.classList.contains('inline-flex')) {
        // Toggle button
        const isOn = val === 'true';
        el.className = `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isOn ? 'bg-primary' : 'bg-border'}`;
        const dot = el.querySelector('span');
        if (dot) {
          dot.className = `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}`;
        }
      }
    });
  }

  // Highlight active scenario
  document.querySelectorAll('.playground-scenario-btn').forEach((btn) => {
    if (btn.textContent === scenario.label) {
      btn.classList.add('border-primary/60', 'bg-primary/5', 'text-primary-light');
      btn.classList.remove('text-text-muted');
    } else {
      btn.classList.remove('border-primary/60', 'bg-primary/5', 'text-primary-light');
      btn.classList.add('text-text-muted');
    }
  });

  updateOutput();
}

function getChangedValues(): { key: string; value: string; defaultValue: string }[] {
  const fields = getFields(selectedSlug);
  const changes: { key: string; value: string; defaultValue: string }[] = [];
  fields.forEach((field) => {
    const val = currentValues[field.key];
    if (val !== undefined && val !== field.default && val !== '') {
      changes.push({ key: field.key, value: val, defaultValue: field.default });
    }
  });
  return changes;
}

function buildSetFlags(): string[] {
  const changes = getChangedValues();
  return changes.map((c) => `--set ${c.key}=${c.value}`);
}

function generateHelmOutput(): string {
  if (!selectedSlug) return '';
  const flags = buildSetFlags();
  const lines: string[] = [];

  lines.push(`<span class="text-emerald-400">helm</span> install ${selectedSlug} helmforge/${selectedSlug} \\`);
  lines.push(`  --namespace helmforge \\`);

  flags.forEach((flag) => {
    lines.push(`  ${flag} \\`);
  });

  lines.push(`  --wait --timeout 5m`);
  return lines.join('\n');
}

function generateValuesYaml(): string {
  if (!selectedSlug) return '';
  const changes = getChangedValues();
  if (changes.length === 0) {
    return '<span class="text-zinc-500"># No values changed from defaults</span>\n<span class="text-zinc-500"># Modify settings above to generate a custom values.yaml</span>';
  }

  const lines: string[] = [];
  lines.push(`<span class="text-zinc-500"># values.yaml for ${selectedName}</span>`);
  lines.push(`<span class="text-zinc-500"># Generated at helmforge.dev/playground</span>`);
  lines.push('');

  // Build nested YAML from dotted keys
  const tree: Record<string, any> = {};
  changes.forEach(({ key, value }) => {
    const parts = key.split('.');
    let node = tree;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]]) node[parts[i]] = {};
      node = node[parts[i]];
    }
    // Convert booleans and numbers
    if (value === 'true' || value === 'false') {
      node[parts[parts.length - 1]] = value === 'true';
    } else if (/^\d+$/.test(value)) {
      node[parts[parts.length - 1]] = parseInt(value, 10);
    } else {
      node[parts[parts.length - 1]] = value;
    }
  });

  function renderYaml(obj: Record<string, any>, indent: number): void {
    for (const [k, v] of Object.entries(obj)) {
      const pad = '  '.repeat(indent);
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        lines.push(`${pad}<span class="text-sky-400">${k}</span>:`);
        renderYaml(v, indent + 1);
      } else if (typeof v === 'boolean') {
        lines.push(`${pad}<span class="text-sky-400">${k}</span>: <span class="text-amber-300">${v}</span>`);
      } else if (typeof v === 'number') {
        lines.push(`${pad}<span class="text-sky-400">${k}</span>: <span class="text-amber-300">${v}</span>`);
      } else {
        lines.push(`${pad}<span class="text-sky-400">${k}</span>: ${v}`);
      }
    }
  }

  renderYaml(tree, 0);
  return lines.join('\n');
}

function getPlainHelmCommand(): string {
  const flags = buildSetFlags();
  const parts = [`helm install ${selectedSlug} helmforge/${selectedSlug}`, '  --namespace helmforge'];
  flags.forEach((f) => parts.push(`  ${f}`));
  parts.push('  --wait --timeout 5m');
  return parts.join(' \\\n');
}

function getPlainValuesYaml(): string {
  const changes = getChangedValues();
  if (changes.length === 0) return '# No values changed from defaults\n';

  const lines: string[] = [];
  lines.push(`# values.yaml for ${selectedName}`);
  lines.push(`# Generated at helmforge.dev/playground`);
  lines.push('');

  const tree: Record<string, any> = {};
  changes.forEach(({ key, value }) => {
    const parts = key.split('.');
    let node = tree;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]]) node[parts[i]] = {};
      node = node[parts[i]];
    }
    if (value === 'true' || value === 'false') {
      node[parts[parts.length - 1]] = value === 'true';
    } else if (/^\d+$/.test(value)) {
      node[parts[parts.length - 1]] = parseInt(value, 10);
    } else {
      node[parts[parts.length - 1]] = value;
    }
  });

  function renderYaml(obj: Record<string, any>, indent: number): void {
    for (const [k, v] of Object.entries(obj)) {
      const pad = '  '.repeat(indent);
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        lines.push(`${pad}${k}:`);
        renderYaml(v, indent + 1);
      } else {
        lines.push(`${pad}${k}: ${v}`);
      }
    }
  }

  renderYaml(tree, 0);
  return lines.join('\n');
}

function updateOutput() {
  if (!codeEl || !selectedSlug) return;
  if (copyBtn) copyBtn.disabled = false;
  if (shareBtn) shareBtn.disabled = false;

  // Update output
  if (outputMode === 'helm') {
    codeEl.innerHTML = generateHelmOutput();
    if (filenameEl) filenameEl.textContent = 'terminal';
  } else {
    codeEl.innerHTML = generateValuesYaml();
    if (filenameEl) filenameEl.textContent = 'values.yaml';
  }

  // Update diff view
  const changes = getChangedValues();
  if (diffEl && diffCountEl && diffListEl) {
    if (changes.length > 0) {
      diffEl.classList.remove('hidden');
      diffCountEl.textContent = String(changes.length);
      diffListEl.innerHTML = '';
      changes.forEach((c) => {
        const tag = document.createElement('span');
        tag.className =
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/5 border border-primary/20 text-primary-light';
        tag.innerHTML = `<span class="font-mono text-[10px]">${c.key}</span><span class="text-text-muted">=</span><span class="font-mono">${c.value}</span>`;
        diffListEl.appendChild(tag);
      });
    } else {
      diffEl.classList.add('hidden');
    }
  }

  updateUrlState();
}

// URL state management for shareable links
function updateUrlState() {
  if (!selectedSlug) return;
  const params = new URLSearchParams();
  params.set('chart', selectedSlug);
  const changes = getChangedValues();
  changes.forEach((c) => {
    params.set(c.key, c.value);
  });
  const url = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', url);
}

function loadFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const chart = params.get('chart');
  if (!chart) return;

  // Find and click the chart button
  const btn = Array.from(chartBtns).find((b) => b.dataset.slug === chart);
  if (!btn) return;

  selectChart(chart, btn.dataset.name ?? chart);

  // Apply URL params
  const fields = getFields(chart);
  let hasChanges = false;
  fields.forEach((field) => {
    const val = params.get(field.key);
    if (val !== null) {
      currentValues[field.key] = val;
      hasChanges = true;
    }
  });

  if (hasChanges) {
    // Update UI controls
    if (controlsEl) {
      const controls = controlsEl.querySelectorAll<HTMLElement>('[data-field-key]');
      controls.forEach((el) => {
        const key = el.dataset.fieldKey ?? '';
        const val = currentValues[key];
        if (val === undefined) return;

        if (el instanceof HTMLSelectElement) {
          el.value = val;
        } else if (el instanceof HTMLInputElement) {
          el.value = val;
        } else if (el.tagName === 'BUTTON' && el.classList.contains('inline-flex')) {
          const isOn = val === 'true';
          el.className = `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isOn ? 'bg-primary' : 'bg-border'}`;
          const dot = el.querySelector('span');
          if (dot) {
            dot.className = `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}`;
          }
        }
      });
    }
    updateOutput();
  }
}

// Output format toggle
outputBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    outputMode = (btn.dataset.output as OutputMode) ?? 'helm';
    outputBtns.forEach((b) => {
      if (b === btn) {
        b.classList.add('bg-primary', 'text-white');
        b.classList.remove('text-text-muted');
      } else {
        b.classList.remove('bg-primary', 'text-white');
        b.classList.add('text-text-muted');
      }
    });
    updateOutput();
  });
});

// Chart selection
chartBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    selectChart(btn.dataset.slug ?? '', btn.dataset.name ?? '');
  });
});

// Search filter
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase().trim();
    chartItems.forEach((item) => {
      const slug = item.dataset.slug ?? '';
      const name = (item.dataset.name ?? '').toLowerCase();
      item.style.display = slug.includes(term) || name.includes(term) ? '' : 'none';
    });
  });
}

// Copy
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    if (!selectedSlug) return;
    const text = outputMode === 'helm' ? getPlainHelmCommand() : getPlainValuesYaml();
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy to clipboard'), 2000);
    } catch {
      // Fallback
    }
  });
}

// Share
if (shareBtn) {
  shareBtn.addEventListener('click', async () => {
    if (!selectedSlug) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      shareBtn.textContent = 'Link copied!';
      setTimeout(() => (shareBtn.textContent = 'Share'), 2000);
    } catch {
      // Fallback
    }
  });
}

// Load state from URL on page load
loadFromUrl();
