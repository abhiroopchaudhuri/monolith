#!/usr/bin/env tsx
/**
 * extract-icons.ts — Enumerate the DS's icon package.
 *
 * USAGE:
 *   tsx scripts/extract-icons.ts --adapter <path> --out <dir>/icons.json
 *
 * Reads adapter.iconPackage. If the package exposes a flat barrel export, parse the
 * export list. If it ships a JSON manifest, load it. If neither, walk the package
 * folder for individual icon component files.
 *
 * Normalized shape:
 *   { package: "<ds-icon-package>", names: ["<IconName1>", "<IconName2>", ...] }
 *
 * If no icon package is declared, emit { package: null, names: [] } + warning.
 *
 * TODO(M1): implement.
 */
export {};
// TODO: implement.
