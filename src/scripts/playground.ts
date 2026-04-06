import { DEFAULT_LOCALE, normalizeLocale, type Locale } from '../i18n/config';
import { ensureLocaleMessages, getMessage } from './i18n-client-store';

declare global {
  interface Window {
    __HF_LOCALE__?: Locale;
  }
}

interface FieldConfig {
  label: string;
  key: string;
  type: 'text' | 'number' | 'select' | 'toggle';
  default: string;
  options?: string[];
  description: string;
}

interface GroupConfig {
  name: string;
  collapsible?: boolean;
  gateField?: string;
  fields: FieldConfig[];
}

interface Scenario {
  label: string;
  description: string;
  values: Record<string, string>;
}

const configs: Record<string, GroupConfig[]> = (window as any).__playgroundConfigs ?? {};
const scenarios: Record<string, Scenario[]> = (window as any).__playgroundScenarios ?? {};

const chartBtns = document.querySelectorAll<HTMLButtonElement>('.playground-chart-btn');
const chartItems = document.querySelectorAll<HTMLElement>('.playground-chart-btn');
const searchInput = document.getElementById('playground-search') as HTMLInputElement | null;
const emptyEl = document.getElementById('playground-empty');
const fieldsEl = document.getElementById('playground-fields');
const controlsEl = document.getElementById('playground-controls');
const titleEl = document.getElementById('playground-chart-title');
const docsLink = document.getElementById('playground-docs-link') as HTMLAnchorElement | null;
const valuesLink = document.getElementById('playground-values-link') as HTMLAnchorElement | null;
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
// Track which collapsible sections are expanded
let expandedSections: Set<string> = new Set();

function t(key: string, locale: Locale): string {
  return getMessage(key, locale);
}

function getLocale(): Locale {
  return normalizeLocale(window.__HF_LOCALE__) || DEFAULT_LOCALE;
}

function getGroups(slug: string): GroupConfig[] {
  return configs[slug] ?? configs['_default'] ?? [];
}

function getScenarios(slug: string): Scenario[] {
  return scenarios[slug] ?? [];
}

function createToggleButton(isOn: boolean): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isOn ? 'bg-primary' : 'bg-border'}`;
  btn.innerHTML = `<span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}"></span>`;
  return btn;
}

function updateToggleVisual(btn: HTMLButtonElement, isOn: boolean) {
  btn.className = `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isOn ? 'bg-primary' : 'bg-border'}`;
  const dot = btn.querySelector('span');
  if (dot) {
    dot.className = `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}`;
  }
}

function selectChart(slug: string, name: string) {
  selectedSlug = slug;
  selectedName = name;
  currentValues = {};
  expandedSections = new Set();

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
  if (valuesLink) valuesLink.href = `https://github.com/helmforgedev/charts/blob/main/charts/${slug}/values.yaml`;
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

  // Initialize all field defaults
  const groups = getGroups(slug);
  for (const group of groups) {
    if (group.gateField) {
      currentValues[group.gateField] = 'false';
    }
    for (const field of group.fields) {
      currentValues[field.key] = field.default;
    }
  }

  buildControls();
  updateOutput();
  updateUrlState();
}

function buildControls() {
  if (!controlsEl) return;
  controlsEl.innerHTML = '';

  const groups = getGroups(selectedSlug);

  for (const group of groups) {
    const isCollapsible = group.collapsible === true;
    const isExpanded = expandedSections.has(group.name);

    // Group container
    const groupContainer = document.createElement('div');
    groupContainer.className = 'playground-group';
    groupContainer.dataset.groupName = group.name;

    // Group header
    const groupHeader = document.createElement('div');

    if (isCollapsible) {
      // Collapsible header with toggle
      groupHeader.className =
        'flex items-center justify-between py-2.5 px-3 rounded-xl cursor-pointer select-none transition-all hover:bg-bg-surface/60 border border-transparent' +
        (isExpanded ? ' border-primary/20 bg-bg-surface/40' : '');

      const headerLeft = document.createElement('div');
      headerLeft.className = 'flex items-center gap-2';

      const chevron = document.createElement('svg');
      chevron.className = `w-3.5 h-3.5 text-text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`;
      chevron.setAttribute('fill', 'none');
      chevron.setAttribute('stroke', 'currentColor');
      chevron.setAttribute('viewBox', '0 0 24 24');
      chevron.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>';

      const headerLabel = document.createElement('span');
      headerLabel.className = 'text-xs font-bold uppercase tracking-[0.12em] text-text-muted';
      headerLabel.textContent = group.name;

      headerLeft.appendChild(chevron);
      headerLeft.appendChild(headerLabel);

      const toggleBtn = createToggleButton(isExpanded);
      toggleBtn.dataset.sectionToggle = group.name;

      // Click on toggle
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSection(group);
      });

      // Click on header row
      groupHeader.addEventListener('click', () => {
        toggleSection(group);
      });

      groupHeader.appendChild(headerLeft);
      groupHeader.appendChild(toggleBtn);
    } else {
      // Non-collapsible group header
      groupHeader.className = 'text-xs font-bold uppercase tracking-[0.12em] text-text-muted mb-2 px-1';
      if (controlsEl.children.length > 0) {
        groupHeader.classList.add('mt-3', 'pt-3', 'border-t', 'border-border');
      }
      groupHeader.textContent = group.name;
    }

    groupContainer.appendChild(groupHeader);

    // Fields container
    const fieldsContainer = document.createElement('div');
    fieldsContainer.className = 'playground-group-fields overflow-hidden transition-all duration-200';
    fieldsContainer.dataset.groupFields = group.name;

    if (isCollapsible && !isExpanded) {
      fieldsContainer.style.maxHeight = '0';
      fieldsContainer.style.opacity = '0';
    } else {
      fieldsContainer.style.maxHeight = 'none';
      fieldsContainer.style.opacity = '1';
    }

    const fieldsInner = document.createElement('div');
    fieldsInner.className = isCollapsible
      ? 'space-y-2 pt-2 pb-1 pl-3 border-l-2 border-primary/20 ml-2 mt-1'
      : 'space-y-2';

    for (const field of group.fields) {
      const fieldEl = buildFieldControl(field);
      fieldsInner.appendChild(fieldEl);
    }

    fieldsContainer.appendChild(fieldsInner);
    groupContainer.appendChild(fieldsContainer);
    controlsEl.appendChild(groupContainer);
  }
}

function toggleSection(group: GroupConfig) {
  const isExpanded = expandedSections.has(group.name);

  if (isExpanded) {
    // Collapse: reset child fields to defaults and set gate to false
    expandedSections.delete(group.name);
    if (group.gateField) {
      currentValues[group.gateField] = 'false';
    }
    for (const field of group.fields) {
      currentValues[field.key] = field.default;
    }
  } else {
    // Expand: set gate to true
    expandedSections.add(group.name);
    if (group.gateField) {
      currentValues[group.gateField] = 'true';
    }
  }

  // Update the group visuals
  const groupEl = controlsEl?.querySelector(`[data-group-name="${group.name}"]`);
  if (!groupEl) return;

  const fieldsContainer = groupEl.querySelector(`[data-group-fields="${group.name}"]`) as HTMLElement;
  const toggleBtn = groupEl.querySelector(`[data-section-toggle="${group.name}"]`) as HTMLButtonElement;
  const chevron = groupEl.querySelector('svg');
  const header = groupEl.querySelector(':scope > div:first-child') as HTMLElement;
  const nowExpanded = expandedSections.has(group.name);

  if (fieldsContainer) {
    if (nowExpanded) {
      fieldsContainer.style.maxHeight = fieldsContainer.scrollHeight + 'px';
      fieldsContainer.style.opacity = '1';
      // After transition, set to none so new content isn't clipped
      setTimeout(() => {
        fieldsContainer.style.maxHeight = 'none';
      }, 200);
    } else {
      // First set a concrete height, then collapse
      fieldsContainer.style.maxHeight = fieldsContainer.scrollHeight + 'px';
      requestAnimationFrame(() => {
        fieldsContainer.style.maxHeight = '0';
        fieldsContainer.style.opacity = '0';
      });
    }
  }

  if (toggleBtn) updateToggleVisual(toggleBtn, nowExpanded);
  if (chevron) {
    chevron.classList.toggle('rotate-90', nowExpanded);
  }
  if (header) {
    if (nowExpanded) {
      header.classList.add('border-primary/20', 'bg-bg-surface/40');
      header.classList.remove('border-transparent');
    } else {
      header.classList.remove('border-primary/20', 'bg-bg-surface/40');
      header.classList.add('border-transparent');
    }
  }

  updateOutput();
}

function buildFieldControl(field: FieldConfig): HTMLElement {
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
      if (opt === (currentValues[field.key] ?? field.default)) option.selected = true;
      select.appendChild(option);
    });
    select.addEventListener('change', () => {
      currentValues[field.key] = select.value;
      updateOutput();
    });
    controlDiv.appendChild(select);
  } else if (field.type === 'toggle') {
    const isOn = (currentValues[field.key] ?? field.default) === 'true';
    const btn = createToggleButton(isOn);
    btn.dataset.fieldKey = field.key;
    btn.addEventListener('click', () => {
      const wasOn = currentValues[field.key] === 'true';
      currentValues[field.key] = wasOn ? 'false' : 'true';
      updateToggleVisual(btn, !wasOn);
      updateOutput();
    });
    controlDiv.appendChild(btn);
  } else if (field.type === 'number') {
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '1';
    input.max = '10';
    input.value = currentValues[field.key] ?? field.default;
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
    input.value = currentValues[field.key] ?? field.default;
    input.dataset.fieldKey = field.key;
    input.className =
      'w-36 rounded-lg border border-border bg-bg-surface/80 px-3 py-1.5 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-primary-light';
    input.addEventListener('input', () => {
      currentValues[field.key] = input.value;
      updateOutput();
    });
    controlDiv.appendChild(input);
  }

  div.appendChild(labelDiv);
  div.appendChild(controlDiv);
  return div;
}

function applyScenario(scenario: Scenario) {
  const groups = getGroups(selectedSlug);

  // Reset all to defaults
  for (const group of groups) {
    if (group.gateField) {
      currentValues[group.gateField] = 'false';
    }
    for (const field of group.fields) {
      currentValues[field.key] = field.default;
    }
  }
  expandedSections.clear();

  // Apply scenario values
  for (const [key, val] of Object.entries(scenario.values)) {
    currentValues[key] = val;
  }

  // Determine which collapsible sections should be expanded
  for (const group of groups) {
    if (!group.collapsible) continue;
    if (group.gateField && currentValues[group.gateField] === 'true') {
      expandedSections.add(group.name);
    } else if (!group.gateField) {
      // Resources-type: expand if any field changed from default
      const hasChange = group.fields.some((f) => currentValues[f.key] !== f.default);
      if (hasChange) expandedSections.add(group.name);
    }
  }

  // Rebuild controls to reflect new state
  buildControls();

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
  const groups = getGroups(selectedSlug);
  const changes: { key: string; value: string; defaultValue: string }[] = [];

  for (const group of groups) {
    // For collapsible sections with a gate field, include the gate if enabled
    if (group.gateField && currentValues[group.gateField] === 'true') {
      changes.push({ key: group.gateField, value: 'true', defaultValue: 'false' });
    }

    // Only include child fields if section is expanded (or not collapsible)
    if (group.collapsible && !expandedSections.has(group.name)) continue;

    for (const field of group.fields) {
      const val = currentValues[field.key];
      if (group.collapsible && expandedSections.has(group.name)) {
        // Expanded collapsible sections emit all fields (enabling means user wants these values)
        if (val !== undefined && val !== '') {
          changes.push({ key: field.key, value: val, defaultValue: field.default });
        }
      } else if (val !== undefined && val !== field.default && val !== '') {
        changes.push({ key: field.key, value: val, defaultValue: field.default });
      }
    }
  }

  return changes;
}

function buildSetFlags(): string[] {
  return getChangedValues().map((c) => `--set ${c.key}=${c.value}`);
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
    const locale = getLocale();
    return `<span class="text-zinc-500">${t('playground.values.empty.line1', locale)}</span>\n<span class="text-zinc-500">${t('playground.values.empty.line2', locale)}</span>`;
  }

  const lines: string[] = [];
  lines.push(`<span class="text-zinc-500"># values.yaml for ${selectedName}</span>`);
  lines.push(`<span class="text-zinc-500"># Generated at helmforge.dev/playground</span>`);
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
  if (changes.length === 0) return `${t('playground.values.empty.line1', getLocale())}\n`;

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

  const btn = Array.from(chartBtns).find((b) => b.dataset.slug === chart);
  if (!btn) return;

  selectChart(chart, btn.dataset.name ?? chart);

  // Apply URL params to values
  const groups = getGroups(chart);
  let hasChanges = false;

  for (const group of groups) {
    // Check gate field
    if (group.gateField) {
      const gateVal = params.get(group.gateField);
      if (gateVal === 'true') {
        currentValues[group.gateField] = 'true';
        expandedSections.add(group.name);
        hasChanges = true;
      }
    }

    for (const field of group.fields) {
      const val = params.get(field.key);
      if (val !== null) {
        currentValues[field.key] = val;
        hasChanges = true;
        // Auto-expand collapsible section if a child value is set
        if (group.collapsible) {
          expandedSections.add(group.name);
          if (group.gateField) currentValues[group.gateField] = 'true';
        }
      }
    }
  }

  if (hasChanges) {
    buildControls();
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
      copyBtn.textContent = t('playground.copied', getLocale());
      setTimeout(() => (copyBtn.textContent = t('playground.copy', getLocale())), 2000);
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
      shareBtn.textContent = t('playground.linkCopied', getLocale());
      setTimeout(() => (shareBtn.textContent = t('playground.share', getLocale())), 2000);
    } catch {
      // Fallback
    }
  });
}

// Load state from URL on page load
loadFromUrl();

document.addEventListener('hf:localechange', () => {
  const locale = getLocale();
  if (shareBtn) {
    shareBtn.title = t('playground.shareTitle', locale);
    if (shareBtn.disabled) shareBtn.textContent = t('playground.share', locale);
  }
  if (copyBtn && copyBtn.disabled) copyBtn.textContent = t('playground.copy', locale);
  if (selectedSlug) updateOutput();
});

ensureLocaleMessages(getLocale()).then(() => {
  if (selectedSlug) updateOutput();
});
