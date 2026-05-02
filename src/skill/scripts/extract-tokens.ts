#!/usr/bin/env tsx
/**
 * extract-tokens.ts — Build tokens.json from whatever token shape the DS ships.
 *
 * USAGE:
 *   tsx scripts/extract-tokens.ts --adapter <path> --out <dir>/tokens.json
 *
 * Supports css-vars, json, ts-module, scss.
 * Normalized shape: { color, space, radius, type, shadow, motion }
 */

import fs from 'fs';
import path from 'path';

function extractCssVars(files: string[]): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf-8');
    const matches = content.matchAll(/--([\w-]+):\s*([^;]+);?/g);
    for (const match of matches) {
      const name = match[1];
      const value = match[2].trim();
      let category = 'color';
      if (name.includes('space') || name.includes('gap') || name.includes('padding') || name.includes('margin')) category = 'space';
      else if (name.includes('radius')) category = 'radius';
      else if (name.includes('font') || name.includes('text') || name.includes('line-height') || name.includes('letter-spacing')) category = 'type';
      else if (name.includes('shadow')) category = 'shadow';
      else if (name.includes('motion') || name.includes('transition') || name.includes('duration') || name.includes('ease')) category = 'motion';

      if (!result[category]) result[category] = {};
      result[category][`--${name}`] = value;
    }
  }
  return result;
}

function loadJsonTokens(file: string): any {
  if (!fs.existsSync(file)) return {};
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  if (data.tokens || data.values) return normalizeTokenObject(data.tokens || data.values);
  return normalizeTokenObject(data);
}

function normalizeTokenObject(obj: any): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};
  for (const [key, value] of Object.entries(obj)) {
    let category = 'color';
    const k = key.toLowerCase();
    if (k.includes('space') || k.includes('size') || k.includes('spacing')) category = 'space';
    else if (k.includes('radius')) category = 'radius';
    else if (k.includes('font') || k.includes('typography') || k.includes('text')) category = 'type';
    else if (k.includes('shadow')) category = 'shadow';
    else if (k.includes('motion') || k.includes('transition') || k.includes('duration')) category = 'motion';

    if (!result[category]) result[category] = {};
    if (typeof value === 'string') {
      result[category][key] = value;
    } else if (value && typeof value === 'object') {
      const flat = flattenTokens(value as Record<string, any>, key);
      for (const [fk, fv] of Object.entries(flat)) {
        result[category][fk] = fv;
      }
    }
  }
  return result;
}

function flattenTokens(obj: Record<string, any>, prefix: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      result[fullKey] = value;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenTokens(value, fullKey));
    }
  }
  return result;
}

function main() {
  const args = process.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const adapterPath = getArg('--adapter');
  const outPath = getArg('--out');

  if (!adapterPath || !outPath) {
    console.error('Usage: tsx scripts/extract-tokens.ts --adapter <path> --out <path>');
    process.exit(1);
  }

  const adapter = JSON.parse(fs.readFileSync(adapterPath, 'utf-8'));
  const tokenConfig = adapter.tokens;

  const normalized: Record<string, Record<string, string>> = {
    color: {}, space: {}, radius: {}, type: {}, shadow: {}, motion: {},
  };

  if (!tokenConfig) {
    console.warn('No tokens config in adapter. Emitting empty tokens.json.');
  } else {
    const source = tokenConfig.source || 'css-vars';
    const files = (tokenConfig.files || []).map((f: string) => path.resolve(path.dirname(adapterPath), f));

    switch (source) {
      case 'css-vars':
      case 'scss': {
        const extracted = extractCssVars(files);
        Object.assign(normalized, extracted);
        break;
      }
      case 'json': {
        for (const file of files) {
          const extracted = loadJsonTokens(file);
          for (const [cat, vals] of Object.entries(extracted)) {
            if (normalized[cat]) Object.assign(normalized[cat], vals);
          }
        }
        break;
      }
      case 'ts-module': {
        console.warn('ts-module token extraction requires build step. Falling back to JSON if available.');
        const jsonFiles = files.filter((f: string) => f.endsWith('.json'));
        for (const file of jsonFiles) {
          const extracted = loadJsonTokens(file);
          for (const [cat, vals] of Object.entries(extracted)) {
            if (normalized[cat]) Object.assign(normalized[cat], vals);
          }
        }
        break;
      }
      default:
        console.warn(`Unknown token source: ${source}`);
    }
  }

  for (const [cat, vals] of Object.entries(normalized)) {
    if (Object.keys(vals).length === 0) {
      console.warn(`Warning: no tokens found for category "${cat}".`);
    }
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(normalized, null, 2), 'utf-8');
  console.log(`Tokens extracted to ${outPath}`);
}

main();
