#!/usr/bin/env tsx
/**
 * extract-icons.ts — Enumerate the DS's icon package.
 *
 * USAGE:
 *   tsx scripts/extract-icons.ts --adapter <path> --out <dir>/icons.json
 *
 * Reads adapter.iconPackage. Normalizes to { package, names[] }.
 */

import fs from 'fs';
import path from 'path';

function main() {
  const args = process.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const adapterPath = getArg('--adapter');
  const outPath = getArg('--out');

  if (!adapterPath || !outPath) {
    console.error('Usage: tsx scripts/extract-icons.ts --adapter <path> --out <path>');
    process.exit(1);
  }

  const adapter = JSON.parse(fs.readFileSync(adapterPath, 'utf-8'));
  const iconPackage = adapter.iconPackage;

  if (!iconPackage) {
    const result = { package: null, names: [] };
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');
    console.warn('No iconPackage declared in adapter. Emitted empty icons.json.');
    return;
  }

  let names: string[] = [];

  // Strategy 1: JSON manifest
  const manifestPath = iconPackage.manifest;
  if (manifestPath && fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    names = Array.isArray(manifest) ? manifest : manifest.names ?? manifest.icons ?? Object.keys(manifest);
  }

  // Strategy 2: barrel export file
  const barrelPath = iconPackage.barrel;
  if (names.length === 0 && barrelPath && fs.existsSync(barrelPath)) {
    const content = fs.readFileSync(barrelPath, 'utf-8');
    const exportMatches = content.matchAll(/export\s+\{[^}]*\}|export\s+\*\s+from\s+['"][^'"]+['"]/g);
    for (const match of exportMatches) {
      const inner = match[0];
      const named = inner.match(/\b[A-Z][A-Za-z0-9]*Icon\b/g);
      if (named) names.push(...named);
    }
  }

  // Strategy 3: walk package folder for component files
  const pkgDir = iconPackage.dir || iconPackage.package;
  if (names.length === 0 && pkgDir && fs.existsSync(pkgDir)) {
    const entries = fs.readdirSync(pkgDir);
    names = entries
      .filter((f) => f.endsWith('.tsx') || f.endsWith('.jsx') || f.endsWith('.svg'))
      .map((f) => path.basename(f, path.extname(f)))
      .filter((n) => n[0] === n[0].toUpperCase() || n.toLowerCase().includes('icon'));
  }

  const result = {
    package: iconPackage.package || iconPackage.name || null,
    names: [...new Set(names)].sort(),
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`Extracted ${result.names.length} icons to ${outPath}`);
}

main();
