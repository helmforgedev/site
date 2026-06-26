/**
 * Build-time schema loader for the HelmForge Playground.
 *
 * Reads values.schema.json + values.yaml from every chart in the charts repo
 * and produces a compact UI-friendly JSON structure that the client-side
 * playground renderer consumes.
 *
 * This replaces 10,400+ lines of hardcoded chartConfigs in playground.astro.
 */
import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlaygroundField {
  label: string;
  key: string; // dot-path, e.g. "auth.database"
  type: 'text' | 'number' | 'select' | 'toggle';
  default: string;
  options?: string[];
  description: string;
}

export interface PlaygroundGroup {
  name: string;
  collapsible?: boolean;
  gateField?: string; // e.g. "ingress.enabled"
  fields: PlaygroundField[];
}

export type ChartPlaygroundConfig = PlaygroundGroup[];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve the charts repo root. */
function chartsRoot(): string {
  // process.cwd() is the site root during Astro build
  const siteRoot = process.cwd();

  // CI: charts repo checked out inside workspace as .charts-repo
  const ciCandidate = path.join(siteRoot, '.charts-repo', 'charts');
  if (fs.existsSync(ciCandidate)) return ciCandidate;

  // Local dev: charts repo is a sibling directory
  const localCandidate = path.join(siteRoot, '..', 'charts', 'charts');
  if (fs.existsSync(localCandidate)) return localCandidate;

  // Fallback: environment variable
  const envRoot = process.env.HELMFORGE_CHARTS_ROOT;
  if (envRoot && fs.existsSync(envRoot)) return envRoot;

  throw new Error(
    `Cannot find charts directory. Tried ${candidate}. Set HELMFORGE_CHARTS_ROOT if the charts repo is elsewhere.`,
  );
}

/** Human-readable label from a schema property key. */
function keyToLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase → words
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/Cpu\b/gi, 'CPU')
    .replace(/Tls\b/gi, 'TLS')
    .replace(/Pvc\b/gi, 'PVC')
    .replace(/Ip\b/gi, 'IP')
    .replace(/Url\b/gi, 'URL')
    .replace(/S3\b/gi, 'S3')
    .replace(/Cidr/gi, 'CIDR')
    .replace(/Hba/gi, 'HBA')
    .trim();
}

/** Pretty section name from a top-level key. */
function sectionName(key: string): string {
  const map: Record<string, string> = {
    auth: 'Authentication',
    image: 'Image',
    persistence: 'Persistence',
    ingress: 'Ingress',
    resources: 'Resources',
    service: 'Service',
    backup: 'Backup',
    tls: 'TLS',
    config: 'Configuration',
    postgresql: 'PostgreSQL',
    mysql: 'MySQL',
    redis: 'Redis',
    mongodb: 'MongoDB',
    mariadb: 'MariaDB',
    memcached: 'Memcached',
    valkey: 'Valkey',
    externalSecrets: 'External Secrets',
    networkPolicy: 'Network Policy',
    serviceAccount: 'Service Account',
    podSecurityContext: 'Pod Security',
    securityContext: 'Security Context',
    autoscaling: 'Autoscaling',
    metrics: 'Metrics',
    initContainers: 'Init Containers',
    sidecars: 'Sidecars',
    env: 'Environment',
  };
  return map[key] || keyToLabel(key);
}

/** Determine playground field type from JSON Schema property. */
function inferFieldType(prop: Record<string, unknown>): PlaygroundField['type'] {
  if (prop.type === 'boolean') return 'toggle';
  if (prop.enum && Array.isArray(prop.enum)) return 'select';
  if (prop.type === 'integer' || prop.type === 'number') return 'number';
  return 'text';
}

/** Stringify a default value for the playground. */
function stringifyDefault(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && val.length === 0) return '';
  if (typeof val === 'object' && Object.keys(val as object).length === 0) return '';
  return JSON.stringify(val);
}

// Keys to always skip (internal/infra, not user-facing in playground)
const SKIP_KEYS = new Set([
  'nameOverride',
  'fullnameOverride',
  'commonLabels',
  'commonAnnotations',
  'clusterDomain',
  'imagePullSecrets',
  'podAnnotations',
  'podLabels',
  'nodeSelector',
  'tolerations',
  'affinity',
  'topologySpreadConstraints',
  'priorityClassName',
  'schedulerName',
  'terminationGracePeriodSeconds',
  'dnsPolicy',
  'dnsConfig',
  'hostNetwork',
  'hostPID',
  'hostIPC',
  'extraVolumes',
  'extraVolumeMounts',
  'extraContainers',
  'extraInitContainers',
  'extraEnvVars',
  'extraEnvVarsCM',
  'extraEnvVarsSecret',
  'lifecycleHooks',
  'command',
  'args',
  'sidecars',
  'initContainers',
  'podSecurityContext',
  'securityContext',
  'containerSecurityContext',
  'updateStrategy',
  'revisionHistoryLimit',
  'diagnosticMode',
  'tests',
]);

// Top-level keys to skip entirely (complex objects that don't map to simple forms)
const SKIP_SECTIONS = new Set(['networkPolicy', 'serviceMonitor', 'prometheusRule', 'podDisruptionBudget']);

/** Sections that get an `enabled` gate and are collapsible by default. */
const GATED_SECTIONS = new Set(['ingress', 'backup', 'tls', 'autoscaling', 'metrics', 'externalSecrets']);

// ---------------------------------------------------------------------------
// Schema flattener
// ---------------------------------------------------------------------------

function flattenProperties(
  properties: Record<string, Record<string, unknown>>,
  prefix: string,
  maxDepth: number,
): PlaygroundField[] {
  const fields: PlaygroundField[] = [];
  if (maxDepth <= 0) return fields;

  for (const [key, prop] of Object.entries(properties)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    // Skip infrastructure keys at any level
    if (SKIP_KEYS.has(key)) continue;

    // Leaf property: has a primitive type or enum
    const propType = prop.type as string | undefined;
    if (
      propType === 'string' ||
      propType === 'boolean' ||
      propType === 'integer' ||
      propType === 'number' ||
      prop.enum
    ) {
      const fieldType = inferFieldType(prop);
      const field: PlaygroundField = {
        label: keyToLabel(key),
        key: fullKey,
        type: fieldType,
        default: stringifyDefault(prop.default),
        description: (prop.description as string) || '',
      };
      if (fieldType === 'select' && prop.enum) {
        field.options = (prop.enum as unknown[]).map(String);
      }
      fields.push(field);
      continue;
    }

    // Object with sub-properties: recurse
    if (propType === 'object' && prop.properties) {
      const subFields = flattenProperties(
        prop.properties as Record<string, Record<string, unknown>>,
        fullKey,
        maxDepth - 1,
      );
      fields.push(...subFields);
      continue;
    }

    // Arrays and other complex types: skip in playground (not form-friendly)
  }

  return fields;
}

function schemaToPlaygroundConfig(schema: Record<string, unknown>): ChartPlaygroundConfig {
  const properties = schema.properties as Record<string, Record<string, unknown>> | undefined;
  if (!properties) return [];

  const groups: ChartPlaygroundConfig = [];

  // Collect top-level non-object properties into "General" group
  const generalFields: PlaygroundField[] = [];

  for (const [key, prop] of Object.entries(properties)) {
    if (SKIP_KEYS.has(key) || SKIP_SECTIONS.has(key)) continue;

    const propType = prop.type as string | undefined;

    // Top-level leaf property → General group
    if (
      propType === 'string' ||
      propType === 'boolean' ||
      propType === 'integer' ||
      propType === 'number' ||
      prop.enum
    ) {
      const fieldType = inferFieldType(prop);
      const field: PlaygroundField = {
        label: keyToLabel(key),
        key,
        type: fieldType,
        default: stringifyDefault(prop.default),
        description: (prop.description as string) || '',
      };
      if (fieldType === 'select' && prop.enum) {
        field.options = (prop.enum as unknown[]).map(String);
      }
      generalFields.push(field);
      continue;
    }

    // Top-level object → section group
    if (propType === 'object' && prop.properties) {
      const subProps = prop.properties as Record<string, Record<string, unknown>>;
      const fields = flattenProperties(subProps, key, 3);

      if (fields.length === 0) continue;

      const group: PlaygroundGroup = {
        name: sectionName(key),
        fields,
      };

      // Check if the section has an "enabled" gate field
      if (GATED_SECTIONS.has(key) && subProps.enabled) {
        group.collapsible = true;
        group.gateField = `${key}.enabled`;
        // Remove the enabled field from the fields list (it's the gate toggle)
        group.fields = group.fields.filter((f) => f.key !== `${key}.enabled`);
      } else if (subProps.enabled && subProps.enabled.type === 'boolean') {
        // Non-standard gated section (e.g., postgresql subchart)
        group.collapsible = true;
        group.gateField = `${key}.enabled`;
        group.fields = group.fields.filter((f) => f.key !== `${key}.enabled`);
      }

      groups.push(group);
    }
  }

  // Add General group first if it has fields
  if (generalFields.length > 0) {
    groups.unshift({ name: 'General', fields: generalFields });
  }

  // Add Resources group if not already present (from resources.requests/limits)
  const hasResources = groups.some((g) => g.name === 'Resources');
  if (!hasResources && properties.resources) {
    const resProps = properties.resources as Record<string, unknown>;
    if (resProps.properties) {
      const fields = flattenProperties(resProps.properties as Record<string, Record<string, unknown>>, 'resources', 3);
      if (fields.length > 0) {
        groups.push({ name: 'Resources', collapsible: true, fields });
      }
    }
  }

  return groups;
}

// ---------------------------------------------------------------------------
// Public API (used by Astro at build time)
// ---------------------------------------------------------------------------

/**
 * Load playground configs for all charts that have a values.schema.json.
 * Returns a Record<slug, ChartPlaygroundConfig>.
 */
export function loadAllPlaygroundConfigs(): Record<string, ChartPlaygroundConfig> {
  const root = chartsRoot();
  const configs: Record<string, ChartPlaygroundConfig> = {};

  const chartDirs = fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory());

  for (const dir of chartDirs) {
    const schemaPath = path.join(root, dir.name, 'values.schema.json');
    if (!fs.existsSync(schemaPath)) continue;

    try {
      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8')) as Record<string, unknown>;
      const config = schemaToPlaygroundConfig(schema);

      // Only include charts that produce meaningful playground fields
      const totalFields = config.reduce((sum, g) => sum + g.fields.length, 0);
      if (totalFields >= 2) {
        configs[dir.name] = config;
      }
    } catch {
      // Skip charts with broken schemas
      console.warn(`[playground-schema] Failed to parse schema for ${dir.name}`);
    }
  }

  return configs;
}

/**
 * Get the playground config for a single chart slug.
 */
export function loadPlaygroundConfig(slug: string): ChartPlaygroundConfig | null {
  const root = chartsRoot();
  const schemaPath = path.join(root, slug, 'values.schema.json');
  if (!fs.existsSync(schemaPath)) return null;

  try {
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8')) as Record<string, unknown>;
    return schemaToPlaygroundConfig(schema);
  } catch {
    return null;
  }
}
