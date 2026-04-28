#!/usr/bin/env tsx
/**
 * extract-tokens.ts — Build tokens.json from whatever token shape the DS ships.
 *
 * USAGE:
 *   tsx scripts/extract-tokens.ts --adapter <path> --out <dir>/tokens.json
 *
 * Supports (pluggable, declared in adapter.tokens.source):
 *   - css-vars       regex walk over adapter.tokens.files
 *   - json           direct load (Style Dictionary, Tokens Studio)
 *   - ts-module      esbuild + safe VM eval
 *   - scss           compile to CSS first, then css-vars path
 *
 * Normalized shape:
 *   { color, space, radius, type, shadow, motion }
 *
 * Missing categories emit `{}` + a warning. Do not synthesize.
 *
 * TODO(M1): reuse ../phase-1-build-with-ds/scripts/extract-tokens.ts.
 */
export {};
// TODO: implement.
