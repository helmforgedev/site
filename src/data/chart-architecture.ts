// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs';
import path from 'node:path';

export interface ArchitectureDiagram {
  title: string;
  mermaid: string;
  description?: string;
}

export interface ChartArchitecture {
  slug: string;
  hasDiagrams: boolean;
  diagrams: ArchitectureDiagram[];
}

export function getChartArchitecture(slug: string): ChartArchitecture {
  const siteRoot = process.cwd();
  const candidates = [
    path.resolve(siteRoot, '../charts/charts', slug, 'DESIGN.md'),
    path.resolve(siteRoot, '.charts-repo/charts', slug, 'DESIGN.md'),
  ];
  if (process.env.HELMFORGE_CHARTS_ROOT) {
    candidates.push(path.resolve(process.env.HELMFORGE_CHARTS_ROOT, slug, 'DESIGN.md'));
  }

  const file = candidates.find((c) => fs.existsSync(c));
  if (!file) {
    return { slug, hasDiagrams: false, diagrams: [] };
  }

  try {
    const text = fs.readFileSync(file, 'utf8');
    const diagrams: ArchitectureDiagram[] = [];

    // Find Architecture section
    const archMatch = text.match(/##\s+Architecture[^\n]*\n([\s\S]*?)(?=\n##\s+[A-Z]|$)/i);
    if (!archMatch) {
      // fallback: find any mermaid block in entire document
      const allMermaid = [...text.matchAll(/```mermaid\s*\n([\s\S]*?)\n```/g)];
      if (allMermaid.length > 0) {
        return {
          slug,
          hasDiagrams: true,
          diagrams: allMermaid.map((m, idx) => ({
            title: idx === 0 ? 'Architecture Topology' : `Topology Diagram ${idx + 1}`,
            mermaid: m[1].trim(),
          })),
        };
      }
      return { slug, hasDiagrams: false, diagrams: [] };
    }

    const archContent = archMatch[1];
    const subSections = archContent.split(/\n###\s+/);

    if (subSections.length > 1) {
      const preText = subSections[0];
      const preMermaid = preText.match(/```mermaid\s*\n([\s\S]*?)\n```/);
      if (preMermaid) {
        diagrams.push({
          title: 'Overview',
          mermaid: preMermaid[1].trim(),
        });
      }

      for (let i = 1; i < subSections.length; i++) {
        const section = subSections[i];
        const lines = section.split('\n');
        const title = lines[0].trim();
        const mMatch = section.match(/```mermaid\s*\n([\s\S]*?)\n```/);
        if (mMatch) {
          const prose = section
            .replace(/```mermaid[\s\S]*?```/, '')
            .split('\n')
            .slice(1)
            .map((l) => l.trim())
            .filter((l) => l.length > 0 && !l.startsWith('#'))
            .slice(0, 2)
            .join(' ');

          diagrams.push({
            title,
            mermaid: mMatch[1].trim(),
            description: prose || undefined,
          });
        }
      }
    } else {
      const mMatches = [...archContent.matchAll(/```mermaid\s*\n([\s\S]*?)\n```/g)];
      mMatches.forEach((m, idx) => {
        diagrams.push({
          title: idx === 0 ? 'Architecture Topology' : `Topology Diagram ${idx + 1}`,
          mermaid: m[1].trim(),
        });
      });
    }

    if (diagrams.length === 0) {
      const allMermaid = [...text.matchAll(/```mermaid\s*\n([\s\S]*?)\n```/g)];
      allMermaid.forEach((m, idx) => {
        diagrams.push({
          title: idx === 0 ? 'Architecture Topology' : `Topology Diagram ${idx + 1}`,
          mermaid: m[1].trim(),
        });
      });
    }

    return {
      slug,
      hasDiagrams: diagrams.length > 0,
      diagrams,
    };
  } catch {
    return { slug, hasDiagrams: false, diagrams: [] };
  }
}
