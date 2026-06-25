interface FieldConfig {
  label: string;
  key: string;
  type: 'text' | 'number' | 'select' | 'toggle';
  default: string;
  min?: string;
  max?: string;
  enables?: string;
  options?: string[];
  valueActivationValues?: Record<string, Record<string, string>>;
  toggleActivationValues?: Record<string, Record<string, string>>;
  activationExpandSections?: Record<string, string[]>;
  activationResetSections?: Record<string, string[]>;
  description: string;
}

interface GroupConfig {
  name: string;
  collapsible?: boolean;
  gateField?: string;
  activationValues?: Record<string, string>;
  emitDefaultsOnExpand?: boolean;
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
let manuallyDisabledAutoEnables: Set<string> = new Set();
// Track which collapsible sections are expanded
let expandedSections: Set<string> = new Set();
let scenarioOnlyKeys: Set<string> = new Set();

const linkedFieldValues: Record<string, Record<string, string>> = {
  dolibarr: {
    'externalSecrets.data[0].secretKey': 'admin.existingSecretPasswordKey',
    'admin.existingSecretPasswordKey': 'externalSecrets.data[0].secretKey',
  },
};

const giteaPostgresqlPassword = 'change-me-gitea-postgresql';

function getGroups(slug: string): GroupConfig[] {
  return configs[slug] ?? configs['_default'] ?? [];
}

function getScenarios(slug: string): Scenario[] {
  return scenarios[slug] ?? [];
}

function getFieldDefault(key: string): string | undefined {
  for (const group of getGroups(selectedSlug)) {
    for (const field of group.fields) {
      if (field.key === key) return field.default;
    }
  }

  return undefined;
}

function getConfiguredKeys(groups: GroupConfig[]): Set<string> {
  const keys = new Set<string>();
  for (const group of groups) {
    if (group.gateField) keys.add(group.gateField);
    for (const field of group.fields) {
      keys.add(field.key);
    }
  }

  return keys;
}

function normalizeIndexedKey(key: string): string {
  return key.replace(/\[\d+\]/g, '[]');
}

function topLevelKey(key: string): string {
  return key.split(/[.[\]]/, 1)[0] ?? key;
}

function groupKeys(group: GroupConfig): string[] {
  const keys = group.fields.map((field) => field.key);
  if (group.gateField) keys.push(group.gateField);
  return keys;
}

function groupOwnsKey(group: GroupConfig, key: string): boolean {
  const normalizedKey = normalizeIndexedKey(key);
  const root = topLevelKey(key);

  return groupKeys(group).some(
    (groupKey) =>
      normalizeIndexedKey(groupKey) === normalizedKey || (group.collapsible === true && topLevelKey(groupKey) === root),
  );
}

function pruneScenarioOnlyKeys(groups: GroupConfig[]): void {
  for (const key of Array.from(scenarioOnlyKeys)) {
    const owner = groups.find((group) => groupOwnsKey(group, key));
    if (owner?.collapsible && !expandedSections.has(owner.name)) {
      scenarioOnlyKeys.delete(key);
      delete currentValues[key];
      continue;
    }

    if (key.startsWith('service.ipFamilies[') && currentValues['service.ipFamilyPolicy'] === 'SingleStack') {
      scenarioOnlyKeys.delete(key);
      delete currentValues[key];
      continue;
    }

    const normalizedKey = normalizeIndexedKey(key);
    const duplicatesConfiguredField = owner?.fields.some(
      (field) => normalizeIndexedKey(field.key) === normalizedKey && currentValues[field.key] === currentValues[key],
    );
    if (duplicatesConfiguredField) {
      scenarioOnlyKeys.delete(key);
      delete currentValues[key];
    }
  }
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

function setFieldValue(key: string, value: string) {
  currentValues[key] = value;
  syncLinkedFieldValue(key, value);
  syncDerivedFieldValues();
}

function syncDerivedFieldValues() {
  const usesCloudflaredManagedTunnel =
    selectedSlug === 'cloudflared' &&
    ((currentValues['tunnel.token'] ?? '').trim() !== '' ||
      (currentValues['tunnel.existingSecret'] ?? '').trim() !== '');

  if (usesCloudflaredManagedTunnel) {
    currentValues['tunnel.quickTunnel.enabled'] = 'false';
    const btn = controlsEl?.querySelector<HTMLButtonElement>('button[data-field-key="tunnel.quickTunnel.enabled"]');
    if (btn) updateToggleVisual(btn, false);
  }
}

function syncLinkedFieldValue(key: string, value: string) {
  const linkedKey = linkedFieldValues[selectedSlug]?.[key];
  if (!linkedKey) return;

  currentValues[linkedKey] = value;
  const linkedControl = controlsEl?.querySelector<HTMLInputElement | HTMLSelectElement>(
    `[data-field-key="${linkedKey}"]`,
  );
  if (linkedControl && linkedControl.value !== value) {
    linkedControl.value = value;
  }
}

function updateToggleField(key: string, isOn: boolean, manual = false) {
  currentValues[key] = isOn ? 'true' : 'false';
  if (manual) {
    if (isOn) {
      manuallyDisabledAutoEnables.delete(key);
    } else {
      manuallyDisabledAutoEnables.add(key);
    }
  }

  const btn = controlsEl?.querySelector<HTMLButtonElement>(`button[data-field-key="${key}"]`);
  if (btn) updateToggleVisual(btn, isOn);
}

function autoEnableField(key: string) {
  if (manuallyDisabledAutoEnables.has(key)) return;
  updateToggleField(key, true);
}

function setControlValue(key: string, value: string) {
  currentValues[key] = value;
  const control = controlsEl?.querySelector<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>(
    `[data-field-key="${key}"]`,
  );

  if (!control) return;
  if (control instanceof HTMLButtonElement) {
    updateToggleVisual(control, value === 'true');
  } else if (control.value !== value) {
    control.value = value;
  }
}

function ensureGiteaPostgresqlPassword() {
  if (currentValues['postgresql.auth.password']) return;
  setControlValue('postgresql.auth.password', giteaPostgresqlPassword);
}

function clearGiteaPostgresqlSideEffects() {
  setControlValue('postgresql.enabled', 'false');
  setControlValue('postgresql.auth.password', '');
}

function clearGiteaExternalDatabaseDetectionFields() {
  setControlValue('database.external.host', '');
  setControlValue('database.external.existingSecret', '');
}

function applyFieldSideEffects(key: string, value: string) {
  if (selectedSlug !== 'gitea') return;

  if (key === 'database.mode' && value === 'postgresql') {
    setControlValue('postgresql.enabled', 'true');
    clearGiteaExternalDatabaseDetectionFields();
    ensureGiteaPostgresqlPassword();
  } else if (key === 'database.mode') {
    clearGiteaPostgresqlSideEffects();
  }

  if (key === 'postgresql.enabled' && value === 'true') {
    if (currentValues['database.mode'] === 'sqlite' || currentValues['database.mode'] === 'external') {
      setControlValue('database.mode', 'auto');
    }
    clearGiteaExternalDatabaseDetectionFields();
    ensureGiteaPostgresqlPassword();
  } else if (key === 'postgresql.enabled') {
    if (currentValues['database.mode'] === 'postgresql') {
      setControlValue('database.mode', 'auto');
    }
    setControlValue('postgresql.auth.password', '');
  }
}

function selectChart(slug: string, name: string) {
  selectedSlug = slug;
  selectedName = name;
  currentValues = {};
  manuallyDisabledAutoEnables = new Set();
  expandedSections = new Set();
  scenarioOnlyKeys = new Set();

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
    for (const key of Object.keys(group.activationValues ?? {})) {
      currentValues[key] = getFieldDefault(key) ?? '';
    }
    syncDerivedFieldValues();
  } else {
    // Expand: set gate to true
    expandedSections.add(group.name);
    if (group.gateField) {
      currentValues[group.gateField] = 'true';
    }
    for (const [key, value] of Object.entries(group.activationValues ?? {})) {
      currentValues[key] = value;
    }
  }

  if (Object.keys(group.activationValues ?? {}).length > 0) {
    buildControls();
    updateOutput();
    updateUrlState();
    return;
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
      const activationValues = field.valueActivationValues?.[select.value];
      const expandSections = field.activationExpandSections?.[select.value];
      const resetSections = field.activationResetSections?.[select.value];
      if (activationValues || expandSections || resetSections) {
        for (const [key, value] of Object.entries(activationValues ?? {})) {
          currentValues[key] = value;
        }
        expandConfiguredSections(expandSections);
        resetAndCollapseSections(resetSections);
        buildControls();
        updateOutput();
        updateUrlState();
        return;
      }
      syncLinkedFieldValue(field.key, select.value);
      if (field.enables) autoEnableField(field.enables);
      applyFieldSideEffects(field.key, select.value);
      updateOutput();
    });
    controlDiv.appendChild(select);
  } else if (field.type === 'toggle') {
    const isOn = (currentValues[field.key] ?? field.default) === 'true';
    const btn = createToggleButton(isOn);
    btn.dataset.fieldKey = field.key;
    btn.addEventListener('click', () => {
      const wasOn = currentValues[field.key] === 'true';
      const nextValue = wasOn ? 'false' : 'true';
      updateToggleField(field.key, nextValue === 'true', true);
      const activationValues = field.toggleActivationValues?.[nextValue];
      const expandSections = field.activationExpandSections?.[nextValue];
      const resetSections = field.activationResetSections?.[nextValue];
      if (activationValues || expandSections || resetSections) {
        for (const [key, value] of Object.entries(activationValues ?? {})) {
          currentValues[key] = value;
        }
        expandConfiguredSections(expandSections);
        resetAndCollapseSections(resetSections);
        buildControls();
        updateOutput();
        updateUrlState();
        return;
      }
      applyFieldSideEffects(field.key, currentValues[field.key]);
      updateOutput();
    });
    controlDiv.appendChild(btn);
  } else if (field.type === 'number') {
    const input = document.createElement('input');
    input.type = 'number';
    input.min = field.min ?? '1';
    input.max = field.max ?? '10';
    input.value = currentValues[field.key] ?? field.default;
    input.dataset.fieldKey = field.key;
    input.className =
      'w-20 rounded-lg border border-border bg-bg-surface/80 px-3 py-1.5 text-sm text-text-base text-center focus:outline-none focus:ring-2 focus:ring-primary-light';
    input.addEventListener('input', () => {
      setFieldValue(field.key, input.value);
      if (field.enables) autoEnableField(field.enables);
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
      setFieldValue(field.key, input.value);
      if (field.enables) autoEnableField(field.enables);
      updateOutput();
    });
    controlDiv.appendChild(input);
  }

  div.appendChild(labelDiv);
  div.appendChild(controlDiv);
  return div;
}

function expandConfiguredSections(sectionNames?: string[]) {
  if (!sectionNames?.length) return;

  const sections = new Set(sectionNames);
  for (const group of getGroups(selectedSlug)) {
    if (!sections.has(group.name)) continue;
    expandedSections.add(group.name);
    for (const [key, value] of Object.entries(group.activationValues ?? {})) {
      currentValues[key] = value;
    }
    if (group.gateField) {
      currentValues[group.gateField] = 'true';
    }
  }
}

function resetAndCollapseSections(sectionNames?: string[]) {
  if (!sectionNames?.length) return;

  const sections = new Set(sectionNames);
  for (const group of getGroups(selectedSlug)) {
    if (!sections.has(group.name)) continue;
    if (group.gateField) {
      currentValues[group.gateField] = 'false';
    }
    for (const field of group.fields) {
      currentValues[field.key] = field.default;
    }
    expandedSections.delete(group.name);
  }
}

function applyScenario(scenario: Scenario) {
  const groups = getGroups(selectedSlug);
  const configuredKeys = getConfiguredKeys(groups);
  manuallyDisabledAutoEnables = new Set();

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
  scenarioOnlyKeys.clear();

  // Apply scenario values
  for (const [key, val] of Object.entries(scenario.values)) {
    currentValues[key] = val;
    if (!configuredKeys.has(key)) {
      scenarioOnlyKeys.add(key);
    }
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
  pruneScenarioOnlyKeys(groups);
  const emittedKeys = new Set<string>();

  function addChange(key: string, value: string, defaultValue: string): void {
    if (emittedKeys.has(key)) return;
    emittedKeys.add(key);
    changes.push({ key, value, defaultValue });
  }

  for (const group of groups) {
    // For collapsible sections with a gate field, include the gate if enabled
    if (group.gateField && currentValues[group.gateField] === 'true') {
      addChange(group.gateField, 'true', 'false');
    }

    // Only include child fields if section is expanded (or not collapsible)
    if (group.collapsible && !expandedSections.has(group.name)) continue;

    for (const field of group.fields) {
      const val = currentValues[field.key];
      if (group.collapsible && expandedSections.has(group.name) && group.emitDefaultsOnExpand !== false) {
        // Expanded collapsible sections normally emit all fields; opt out for read-only tuning groups.
        if (val !== undefined && val !== '') {
          addChange(field.key, val, field.default);
        }
      } else if (val !== undefined && val !== field.default && val !== '') {
        if (field.enables && currentValues[field.enables] === 'true') {
          addChange(field.enables, 'true', 'false');
        }
        addChange(field.key, val, field.default);
      }
    }
  }

  for (const key of scenarioOnlyKeys) {
    const value = currentValues[key];
    if (value !== undefined && value !== '') {
      changes.push({ key, value, defaultValue: '' });
    }
  }

  const usesCloudflaredManagedTunnel =
    selectedSlug === 'cloudflared' &&
    ((currentValues['tunnel.token'] ?? '').trim() !== '' ||
      (currentValues['tunnel.existingSecret'] ?? '').trim() !== '');
  const hasQuickTunnelOverride = changes.some((change) => change.key === 'tunnel.quickTunnel.enabled');
  if (usesCloudflaredManagedTunnel && !hasQuickTunnelOverride) {
    changes.unshift({ key: 'tunnel.quickTunnel.enabled', value: 'false', defaultValue: 'true' });
  }

  return changes;
}

function buildSetFlags(): string[] {
  return getChangedValues().map((c) => {
    const setter = shouldPreserveString(c.key) ? '--set-string' : '--set';
    return `${setter} ${c.key}=${quoteSetValue(c.value)}`;
  });
}

function quoteSetValue(value: string): string {
  const helmEscaped = value.replace(/,/g, '\\,');
  return /\s/.test(helmEscaped) ? `'${helmEscaped.replace(/'/g, "'\\''")}'` : helmEscaped;
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

  const tree: Record<string, any> = {};
  changes.forEach(({ key, value }) => {
    setTreeValue(tree, key, coerceValue(key, value));
  });

  function renderYaml(obj: any, indent: number): void {
    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        const pad = '  '.repeat(indent);
        if (typeof item === 'object' && item !== null) {
          lines.push(`${pad}-`);
          renderYaml(item, indent + 1);
        } else {
          lines.push(`${pad}- ${item}`);
        }
      });
      return;
    }

    for (const [k, v] of Object.entries(obj)) {
      const pad = '  '.repeat(indent);
      if (typeof v === 'object' && v !== null) {
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
    setTreeValue(tree, key, coerceValue(key, value));
  });

  function renderYaml(obj: any, indent: number): void {
    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        const pad = '  '.repeat(indent);
        if (typeof item === 'object' && item !== null) {
          lines.push(`${pad}-`);
          renderYaml(item, indent + 1);
        } else {
          lines.push(`${pad}- ${item}`);
        }
      });
      return;
    }

    for (const [k, v] of Object.entries(obj)) {
      const pad = '  '.repeat(indent);
      if (typeof v === 'object' && v !== null) {
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

function coerceValue(key: string, value: string): boolean | number | string {
  if (shouldPreserveString(key)) return JSON.stringify(value);
  if (value === 'true' || value === 'false') return value === 'true';
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  return value;
}

function shouldPreserveString(key: string): boolean {
  return (
    /(^|\.)extraEnv\[\d+\]\.value$/.test(key) || /(^|\.)env\[\d+\]\.value$/.test(key) || /(^|\.)image\.tag$/.test(key)
  );
}

function parseKeyPath(key: string): Array<string | number> {
  const segments: Array<string | number> = [];
  let token = '';
  let escaped = false;

  for (let i = 0; i < key.length; i++) {
    const char = key[i];

    if (escaped) {
      token += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '.') {
      if (token) segments.push(token);
      token = '';
      continue;
    }

    if (char === '[') {
      if (token) segments.push(token);
      token = '';

      const close = key.indexOf(']', i);
      if (close === -1) break;

      segments.push(Number(key.slice(i + 1, close)));
      i = close;
      continue;
    }

    token += char;
  }

  if (escaped) token += '\\';
  if (token) segments.push(token);
  return segments;
}

function setTreeValue(tree: Record<string, any>, key: string, value: boolean | number | string): void {
  const parts = parseKeyPath(key);
  let node: any = tree;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const nextPart = parts[i + 1];

    if (typeof part === 'number') {
      if (!node[part]) node[part] = typeof nextPart === 'number' ? [] : {};
      node = node[part];
      continue;
    }

    if (!node[part]) node[part] = typeof nextPart === 'number' ? [] : {};
    node = node[part];
  }

  node[parts[parts.length - 1]] = value;
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
  const configuredKeys = getConfiguredKeys(groups);
  const knownScenarioOnlyKeys = new Set<string>();
  for (const scenario of getScenarios(chart)) {
    for (const key of Object.keys(scenario.values)) {
      if (!configuredKeys.has(key)) {
        knownScenarioOnlyKeys.add(key);
      }
    }
  }
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
        setFieldValue(field.key, val);
        hasChanges = true;
        // Auto-expand collapsible section if a child value is set
        if (group.collapsible) {
          expandedSections.add(group.name);
          if (group.gateField) currentValues[group.gateField] = 'true';
        }
      }
    }
  }

  for (const key of knownScenarioOnlyKeys) {
    const val = params.get(key);
    if (val !== null) {
      currentValues[key] = val;
      scenarioOnlyKeys.add(key);
      hasChanges = true;
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
