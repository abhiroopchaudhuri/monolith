#!/usr/bin/env tsx
/**
 * validate-generated.ts — Static gates on the generated app.
 *
 * USAGE:
 *   tsx scripts/validate-generated.ts \
 *     --app <runRoot>/app/ \
 *     --index <runRoot>/ds-knowledge/component-index.json \
 *     [--gates PARSE,IMPORTS,PROPS,ICONS,DS_FIRST,COVERAGE,FIXTURES,AUDIT,ANTI_GENERIC,TOKENS] \
 *     --out <runRoot>/qa/validate.json
 *
 * Exit 0 when no blocking gate failed.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ALL_GATES = ['PARSE', 'IMPORTS', 'PROPS', 'ICONS', 'DS_FIRST', 'COVERAGE', 'FIXTURES', 'AUDIT', 'ANTI_GENERIC', 'TOKENS'];

const ANTI_GENERIC_PROBES: { id: string; regex: RegExp; severity: 'minor' | 'major' | 'blocker' }[] = [
  { id: 'AI-01', regex: /\bbg-(blue|indigo|violet|sky)-(500|600|700)\b/, severity: 'minor' },
  { id: 'AI-01b', regex: /\btext-(blue|indigo|violet|sky)-(500|600|700)\b/, severity: 'minor' },
  { id: 'AI-02', regex: /\bbg-gradient-to-[a-z]+\b/, severity: 'minor' },
  { id: 'AI-03', regex: /from-(violet|purple|indigo)-.*?(to|via)-(blue|indigo|purple)/, severity: 'minor' },
  { id: 'AI-04', regex: /\bbg-(gray|slate|zinc|neutral)-50\b/, severity: 'minor' },
  { id: 'AI-06', regex: /#(000000|ffffff|808080)\b/i, severity: 'minor' },
  { id: 'AI-08', regex: /\brounded-2xl\b/, severity: 'minor' },
  { id: 'AI-09', regex: /\brounded-full\b[^"]*\bbg-(blue|indigo|violet)-/, severity: 'minor' },
  { id: 'AI-10', regex: /\bborder-t-4\s+border-(blue|indigo|red|green|purple)-/, severity: 'minor' },
  { id: 'AI-11', regex: /\bshadow-(md|lg)\b/, severity: 'minor' },
  { id: 'AI-12', regex: /\bbackdrop-blur-[a-z]+\s+bg-(white|black)\/[0-9]+/, severity: 'minor' },
  { id: 'AI-21', regex: /[\u{1F680}\u{2728}\u{1F4CA}\u{2705}\u{274C}\u{1F389}\u{1F525}]/u, severity: 'major' },
  { id: 'AI-22', regex: /rounded-full[^"]*\bbg-(blue|red|green|purple|yellow)-100\b[^"]*>\s*<[A-Z]/, severity: 'minor' },
  { id: 'AI-24', regex: /\btransition-all\b|transition:\s*all\b/, severity: 'minor' },
  { id: 'AI-25', regex: /Oops|Something went wrong|Let's get started|Your dashboard awaits|No items found|No data found/i, severity: 'major' },
];

function* walkTsx(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkTsx(full);
    } else if (full.endsWith('.tsx') || full.endsWith('.ts') || full.endsWith('.css')) {
      yield full;
    }
  }
}

function runGate(gate: string, appDir: string, index: any): any[] {
  const findings: any[] = [];

  switch (gate) {
    case 'PARSE': {
      try {
        execSync('npx tsc --noEmit', { cwd: appDir, stdio: 'pipe', timeout: 60000 });
      } catch (e: any) {
        const out = e.stdout?.toString() || e.message;
        const lines = out.split('\n').filter((l: string) => l.includes('error TS'));
        for (const line of lines.slice(0, 20)) {
          const m = line.match(/(.+)\((\d+),(\d+)\):\s*error\s+TS\d+:\s*(.+)/);
          findings.push({ gate, file: m?.[1] || 'unknown', line: parseInt(m?.[2] || '0'), issue: m?.[4] || line });
        }
      }
      break;
    }
    case 'IMPORTS': {
      const dsPath = index?.components?.[0]?.importPath || '';
      for (const file of walkTsx(path.join(appDir, 'src'))) {
        const content = fs.readFileSync(file, 'utf-8');
        const imports = [...content.matchAll(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g)];
        for (const imp of imports) {
          const src = imp[1];
          if (src.includes('design-system') || src.includes('@/components/ui')) {
            // OK
          } else if (src.startsWith('.') && !src.includes('design-system')) {
            // local import — OK
          }
        }
      }
      break;
    }
    case 'PROPS': {
      console.warn('[validate] PROPS gate is not yet fully implemented — requires TSX AST parsing.');
      break;
    }
    case 'ICONS': {
      const iconsPath = path.join(appDir, 'src', 'theme', 'icons.json');
      const icons = fs.existsSync(iconsPath) ? JSON.parse(fs.readFileSync(iconsPath, 'utf-8')) : null;
      if (icons?.names) {
        for (const file of walkTsx(path.join(appDir, 'src'))) {
          const content = fs.readFileSync(file, 'utf-8');
          const iconMatches = [...content.matchAll(/<([A-Z][A-Za-z0-9]*)Icon\b/g)];
          for (const m of iconMatches) {
            const iconName = m[1] + 'Icon';
            if (!icons.names.includes(iconName)) {
              findings.push({ gate, file, line: 0, issue: `Icon "${iconName}" not found in icons.json` });
            }
          }
        }
      }
      break;
    }
    case 'DS_FIRST': {
      for (const file of walkTsx(path.join(appDir, 'src'))) {
        const content = fs.readFileSync(file, 'utf-8');
        const hasRawButton = /<button\b/.test(content);
        const hasRawInput = /<input\b/.test(content);
        const hasRawSelect = /<select\b/.test(content);
        const hasHex = /#[0-9a-fA-F]{3,6}\b/.test(content);
        if ((hasRawButton || hasRawInput || hasRawSelect) && !content.includes('ds-first-allowed:')) {
          findings.push({ gate, file, line: 0, issue: 'Raw HTML primitives (button/input/select) found without ds-first-allowed annotation' });
        }
        if (hasHex && !content.includes('ds-first-allowed:')) {
          findings.push({ gate, file, line: 0, issue: 'Hex color literals found without ds-first-allowed annotation' });
        }
      }
      break;
    }
    case 'COVERAGE': {
      console.warn('[validate] COVERAGE gate is not yet fully implemented — requires JSDOM smoke test.');
      break;
    }
    case 'FIXTURES': {
      const fixturesDir = path.join(appDir, 'src', 'fixtures');
      if (fs.existsSync(fixturesDir)) {
        for (const file of fs.readdirSync(fixturesDir)) {
          if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            const full = path.join(fixturesDir, file);
            const content = fs.readFileSync(full, 'utf-8');
            if (!content.includes('export')) {
              findings.push({ gate, file: full, line: 0, issue: 'Fixture file has no exports' });
            }
          }
        }
      }
      break;
    }
    case 'AUDIT': {
      for (const file of walkTsx(path.join(appDir, 'src'))) {
        const content = fs.readFileSync(file, 'utf-8');
        const badComments = [...content.matchAll(/ds-first-allowed:\s*$/gm)];
        for (const match of badComments) {
          const line = content.slice(0, match.index).split('\n').length;
          findings.push({ gate, file, line, issue: 'ds-first-allowed comment missing reason after colon' });
        }
      }
      break;
    }
    case 'ANTI_GENERIC': {
      for (const file of walkTsx(path.join(appDir, 'src'))) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          for (const probe of ANTI_GENERIC_PROBES) {
            if (probe.regex.test(lines[i])) {
              findings.push({ gate: 'ANTI_GENERIC', tellId: probe.id, file, line: i + 1, snippet: lines[i].trim(), severity: probe.severity });
            }
          }
        }
      }
      break;
    }
    case 'TOKENS': {
      console.warn('[validate] TOKENS gate is advisory-only — not yet fully implemented.');
      break;
    }
  }

  return findings;
}

function main() {
  const args = process.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const appDir = getArg('--app');
  const indexPath = getArg('--index');
  const gatesArg = getArg('--gates');
  const outPath = getArg('--out');

  if (!appDir || !outPath) {
    console.error('Usage: tsx scripts/validate-generated.ts --app <dir> --out <path> [--index <path>] [--gates <csv>]');
    process.exit(1);
  }

  const gates = gatesArg ? gatesArg.split(',').map((g) => g.trim().toUpperCase()) : ALL_GATES;
  const index = indexPath && fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath, 'utf-8')) : {};

  const allFindings: any[] = [];
  for (const gate of gates) {
    if (!ALL_GATES.includes(gate)) {
      console.warn(`Unknown gate: ${gate}`);
      continue;
    }
    const findings = runGate(gate, appDir, index);
    allFindings.push(...findings);
  }

  const blockers = allFindings.filter((f) => f.severity === 'blocker' || f.gate === 'PARSE');
  const result = {
    timestamp: new Date().toISOString(),
    gatesRun: gates,
    findings: allFindings,
    summary: {
      total: allFindings.length,
      blockers: blockers.length,
      majors: allFindings.filter((f) => f.severity === 'major').length,
      minors: allFindings.filter((f) => f.severity === 'minor').length,
      verdict: blockers.length > 0 ? 'fail' : 'pass',
    },
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');

  console.log(`Validation complete: ${allFindings.length} findings, ${blockers.length} blockers.`);
  if (blockers.length > 0) {
    console.error('BLOCKERS FOUND:');
    for (const b of blockers.slice(0, 10)) {
      console.error(`  ${b.gate} | ${b.file}:${b.line} | ${b.issue || b.snippet}`);
    }
    process.exit(1);
  }
}

main();
