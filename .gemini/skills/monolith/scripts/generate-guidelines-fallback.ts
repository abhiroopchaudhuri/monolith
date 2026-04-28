#!/usr/bin/env tsx
/**
 * generate-guidelines-fallback.ts — Synthesize guideline docs from DS evidence only.
 *
 * USAGE:
 *   tsx scripts/generate-guidelines-fallback.ts \
 *     --index <path>/component-index.json \
 *     --tokens <path>/tokens.json \
 *     --readme <path>/README.md \
 *     --out <dir>/guidelines/
 *
 * Every claim carries inline evidence citations. Topics with zero evidence
 * emit "Insufficient evidence — recommend human authoring."
 */

import fs from 'fs';
import path from 'path';

const TOPICS = [
  'voice-tone',
  'accessibility',
  'motion',
  'spacing-layout',
  'color-usage',
  'typography',
  'component-usage',
];

function loadJson(p: string): any {
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function inferFromTokens(tokens: any): Record<string, string> {
  const findings: Record<string, string> = {};
  if (tokens?.color) {
    const keys = Object.keys(tokens.color);
    findings['color-usage'] = `Token categories: ${keys.slice(0, 10).join(', ')} [evidence: tokens:color]`;
  }
  if (tokens?.space) {
    findings['spacing-layout'] = `Space scale: ${Object.keys(tokens.space).slice(0, 10).join(', ')} [evidence: tokens:space]`;
  }
  if (tokens?.type) {
    findings['typography'] = `Type tokens: ${Object.keys(tokens.type).slice(0, 10).join(', ')} [evidence: tokens:type]`;
  }
  if (tokens?.motion) {
    findings['motion'] = `Motion tokens: ${Object.keys(tokens.motion).slice(0, 10).join(', ')} [evidence: tokens:motion]`;
  }
  return findings;
}

function inferFromIndex(index: any): Record<string, string> {
  const findings: Record<string, string> = {};
  if (!index?.components) return findings;

  const components = index.components;
  const a11yProps = new Set<string>();
  for (const comp of components) {
    for (const prop of comp.props ?? []) {
      if (prop.name?.startsWith('aria-') || prop.name === 'role') {
        a11yProps.add(prop.name);
      }
    }
  }
  if (a11yProps.size > 0) {
    findings['accessibility'] = `Components declare aria props: ${Array.from(a11yProps).slice(0, 10).join(', ')} [evidence: component-index:props]`;
  }

  const variantCounts = components.map((c: any) => c.variants?.length ?? 0);
  const avgVariants = variantCounts.reduce((a: number, b: number) => a + b, 0) / (variantCounts.length || 1);
  findings['component-usage'] = `${components.length} components indexed, avg ${avgVariants.toFixed(1)} variants each [evidence: component-index:summary]`;

  return findings;
}

function inferFromReadme(readme: string): Record<string, string> {
  const findings: Record<string, string> = {};
  const lower = readme.toLowerCase();
  if (lower.includes('voice') || lower.includes('tone') || lower.includes('writing')) {
    findings['voice-tone'] = 'README mentions voice/tone guidance [evidence: README:keywords]';
  }
  if (lower.includes('accessibility') || lower.includes('a11y')) {
    findings['accessibility'] = 'README mentions accessibility [evidence: README:keywords]';
  }
  return findings;
}

function main() {
  const args = process.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const indexPath = getArg('--index');
  const tokensPath = getArg('--tokens');
  const readmePath = getArg('--readme');
  const outDir = getArg('--out');

  if (!outDir) {
    console.error('Usage: tsx scripts/generate-guidelines-fallback.ts --out <dir> [--index <path>] [--tokens <path>] [--readme <path>]');
    process.exit(1);
  }

  const index = indexPath ? loadJson(indexPath) : null;
  const tokens = tokensPath ? loadJson(tokensPath) : null;
  const readme = readmePath && fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf-8') : '';

  const tokenFindings = inferFromTokens(tokens);
  const indexFindings = inferFromIndex(index);
  const readmeFindings = inferFromReadme(readme);

  const merged: Record<string, string[]> = {};
  for (const topic of TOPICS) merged[topic] = [];

  for (const [topic, text] of Object.entries(tokenFindings)) merged[topic].push(text);
  for (const [topic, text] of Object.entries(indexFindings)) merged[topic].push(text);
  for (const [topic, text] of Object.entries(readmeFindings)) merged[topic].push(text);

  fs.mkdirSync(outDir, { recursive: true });

  for (const topic of TOPICS) {
    const docs = merged[topic];
    const mdPath = path.join(outDir, `${topic}.md`);
    const jsonPath = path.join(outDir, `${topic}.json`);

    if (docs.length === 0) {
      const fallback = `# ${topic}\n\nInsufficient evidence — recommend human authoring.\n`;
      fs.writeFileSync(mdPath, fallback, 'utf-8');
      fs.writeFileSync(jsonPath, JSON.stringify({ topic, inferred: true, evidenceCount: 0, sources: [] }, null, 2), 'utf-8');
    } else {
      const body = docs.map((d) => `- ${d}`).join('\n');
      fs.writeFileSync(mdPath, `# ${topic}\n\n${body}\n`, 'utf-8');
      fs.writeFileSync(
        jsonPath,
        JSON.stringify(
          {
            topic,
            inferred: true,
            evidenceCount: docs.length,
            sources: docs.map((d) => d.match(/\[evidence: ([^\]]+)\]/)?.[1]).filter(Boolean),
          },
          null,
          2
        ),
        'utf-8'
      );
    }
  }

  console.log(`Fallback guidelines synthesized to ${outDir}`);
}

main();
