#!/usr/bin/env tsx
/**
 * index-ds-repo.ts — Build the DS knowledge pack from a local DS repo.
 *
 * USAGE:
 *   tsx scripts/index-ds-repo.ts \
 *     --adapter ../shared/ds-adapters/<name>.json \
 *     --out .cache/ds-index/<ds>@<ver>/
 *
 * Emits component-index.json + tokens.json + icons.json.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function getRepoHead(repoPath: string): string {
  try {
    return execSync('git rev-parse HEAD', { cwd: repoPath, encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

function getMtime(p: string): number {
  try {
    return fs.statSync(p).mtimeMs;
  } catch {
    return 0;
  }
}

function* walkGlob(dir: string, pattern: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  const posixPattern = pattern.replace(/\\/g, '/');
  const regex = new RegExp(
    '^' +
    posixPattern
      .replace(/\./g, '\\.')
      .replace(/\*\*/g, '{{GLOBSTAR}}')
      .replace(/\*/g, '[^/]*')
      .replace(/\{\{GLOBSTAR\}\}/g, '.*') +
    '$'
  );
  function* walk(current: string): Generator<string> {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        yield* walk(full);
      } else if (regex.test(full.replace(/\\/g, '/'))) {
        yield full;
      }
    }
  }
  yield* walk(dir);
}

function parseComponentFile(filePath: string): any {
  const content = fs.readFileSync(filePath, 'utf-8');
  const name = path.basename(filePath, path.extname(filePath));

  // Extract props from TS interface or type
  const propsMatch = content.match(/interface\s+([A-Z]\w*Props)\s*\{([^}]*)\}/s) ||
                     content.match(/type\s+([A-Z]\w*Props)\s*=\s*\{([^}]*)\}/s);
  const props: any[] = [];
  if (propsMatch) {
    const body = propsMatch[2];
    const lines = body.split(/\n/);
    for (const line of lines) {
      const m = line.match(/^\s*(\w+)(\?)?:\s*([^;]+);?/);
      if (m) {
        props.push({ name: m[1], optional: !!m[2], type: m[3].trim() });
      }
    }
  }

  // Extract variant props (heuristic: props named variant, size, type, etc.)
  const variants = props
    .filter((p) => ['variant', 'size', 'type', 'color', 'intent', 'appearance'].includes(p.name))
    .map((p) => p.name);

  // Extract slots (children or render props)
  const slots = props
    .filter((p) => p.name === 'children' || p.name.endsWith('Render') || p.name.startsWith('render'))
    .map((p) => p.name);

  // A11y props
  const a11y = props
    .filter((p) => p.name.startsWith('aria-') || p.name === 'role')
    .map((p) => p.name);

  // Find stories
  const dir = path.dirname(filePath);
  const storiesPath = path.join(dir, `${name}.stories.tsx`);
  const mdxPath = path.join(dir, `${name}.stories.mdx`);
  const examples: string[] = [];
  if (fs.existsSync(storiesPath)) examples.push(storiesPath);
  if (fs.existsSync(mdxPath)) examples.push(mdxPath);

  // Token references (heuristic regex)
  const tokenRefs = [...content.matchAll(/var\(--([\w-]+)\)|theme\.(\w+)|tokens\.(\w+)/g)]
    .map((m) => m[1] || m[2] || m[3])
    .filter(Boolean);

  return {
    name,
    importPath: filePath,
    props,
    variants: [...new Set(variants)],
    slots: [...new Set(slots)],
    a11y: [...new Set(a11y)],
    examples,
    tokensUsed: [...new Set(tokenRefs)],
  };
}

function main() {
  const args = process.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const adapterPath = getArg('--adapter');
  const outDir = getArg('--out');

  if (!adapterPath || !outDir) {
    console.error('Usage: tsx scripts/index-ds-repo.ts --adapter <path> --out <dir>');
    process.exit(1);
  }

  const adapter = JSON.parse(fs.readFileSync(adapterPath, 'utf-8'));
  const repoPath = adapter.repoPath || path.dirname(adapterPath);
  const componentsGlob = adapter.componentsGlob || '**/*.tsx';
  const importPath = adapter.importPath || adapter.package || 'design-system';

  // Cache key: adapter mtime + repo HEAD
  const cacheKey = `${getMtime(adapterPath)}-${getRepoHead(repoPath)}`;
  const cacheMetaPath = path.join(outDir, '.cache-key');
  if (fs.existsSync(cacheMetaPath) && fs.readFileSync(cacheMetaPath, 'utf-8') === cacheKey) {
    console.log(`Cache hit (${cacheKey}). Skipping re-index.`);
    return;
  }

  fs.mkdirSync(outDir, { recursive: true });

  const components: any[] = [];
  for (const filePath of walkGlob(repoPath, componentsGlob)) {
    const base = path.basename(filePath);
    if (base.includes('.test.') || base.includes('.spec.') || base.includes('.stories.')) continue;
    try {
      components.push(parseComponentFile(filePath));
    } catch (e) {
      console.warn(`Failed to parse ${filePath}:`, (e as Error).message);
    }
  }

  const componentIndex = {
    source: 'repo',
    adapter: adapterPath,
    repoHead: getRepoHead(repoPath),
    generatedAt: new Date().toISOString(),
    components: components.sort((a, b) => a.name.localeCompare(b.name)),
  };

  fs.writeFileSync(path.join(outDir, 'component-index.json'), JSON.stringify(componentIndex, null, 2), 'utf-8');
  fs.writeFileSync(cacheMetaPath, cacheKey, 'utf-8');

  console.log(`Indexed ${components.length} components to ${outDir}`);
  console.log('Run extract-tokens.ts and extract-icons.ts to complete the knowledge pack.');
}

main();
