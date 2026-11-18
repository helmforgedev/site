// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs';
import path from 'node:path';

export interface SchemaParameter {
  key: string;
  type: string;
  default: string;
  description: string;
  enum?: (string | number | boolean)[];
  required?: boolean;
}

export interface SchemaGroup {
  name: string;
  parameters: SchemaParameter[];
}

export function getChartSchema(slug: string): SchemaGroup[] | null {
  const siteRoot = process.cwd();
  const candidates = [
    path.resolve(siteRoot, '../charts/charts', slug, 'values.schema.json'),
    path.resolve(siteRoot, '.charts-repo/charts', slug, 'values.schema.json'),
  ];
  if (process.env.HELMFORGE_CHARTS_ROOT) {
    candidates.push(path.resolve(process.env.HELMFORGE_CHARTS_ROOT, slug, 'values.schema.json'));
  }

  const file = candidates.find((c) => fs.existsSync(c));
  if (!file) return null;

  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    const properties = (raw.properties as Record<string, any>) || {};
    const requiredKeys = new Set<string>(raw.required || []);

    const groupsMap: Record<string, SchemaParameter[]> = {};

    function formatGroupName(key: string): string {
      const map: Record<string, string> = {
        image: 'Image',
        auth: 'Authentication',
        persistence: 'Persistence',
        service: 'Service & Networking',
        ingress: 'Ingress',
        gatewayAPI: 'Gateway API',
        externalSecrets: 'External Secrets',
        metrics: 'Metrics & Observability',
        probes: 'Health Probes',
        resources: 'Resources',
        podSecurityContext: 'Pod Security',
        securityContext: 'Container Security',
        networkPolicy: 'Network Policy',
        serviceAccount: 'Service Account',
        backup: 'Backup',
        tls: 'TLS',
        config: 'Configuration',
        global: 'Global',
      };
      return map[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    function stringifyValue(val: any): string {
      if (val === undefined || val === null) return '-';
      if (typeof val === 'boolean') return val ? 'true' : 'false';
      if (typeof val === 'number') return String(val);
      if (typeof val === 'string') return val === '' ? '""' : val;
      if (Array.isArray(val)) return val.length === 0 ? '[]' : JSON.stringify(val);
      if (typeof val === 'object') return Object.keys(val).length === 0 ? '{}' : JSON.stringify(val);
      return String(val);
    }

    function traverse(props: Record<string, any>, prefix = '', currentGroup = 'General') {
      for (const [key, prop] of Object.entries(props)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const isRoot = prefix === '';
        const groupForProperty = isRoot ? formatGroupName(key) : currentGroup;

        if (prop.type === 'object' && prop.properties && Object.keys(prop.properties).length > 0) {
          traverse(prop.properties, fullKey, groupForProperty);
        } else {
          if (!groupsMap[groupForProperty]) {
            groupsMap[groupForProperty] = [];
          }
          const def = prop.default !== undefined ? prop.default : prop.const;
          groupsMap[groupForProperty].push({
            key: fullKey,
            type: prop.type || (prop.enum ? 'select' : 'any'),
            default: stringifyValue(def),
            description: prop.description || prop.title || '',
            enum: prop.enum,
            required: requiredKeys.has(key) || requiredKeys.has(fullKey),
          });
        }
      }
    }

    traverse(properties);

    return Object.entries(groupsMap).map(([name, parameters]) => ({
      name,
      parameters,
    }));
  } catch {
    return null;
  }
}
