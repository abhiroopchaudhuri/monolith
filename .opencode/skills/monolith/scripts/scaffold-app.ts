#!/usr/bin/env tsx
/**
 * scaffold-app.ts — Lay down the Vite + DS + router + theme skeleton.
 *
 * USAGE:
 *   tsx scripts/scaffold-app.ts \
 *     --plan out/<runId>/docs/build_specs.md \
 *     --specs out/<runId>/docs/design_decisions.md \
 *     --guidelines out/<runId>/guidelines/ \
 *     --tokens out/<runId>/ds-knowledge/tokens.json \
 *     --index out/<runId>/ds-knowledge/component-index.json \
 *     --adapter ../shared/ds-adapters/<name>.json \
 *     --out out/<runId>/app/
 *
 * Reads build_specs.md § file tree + adapter. Writes from templates/*.hbs.
 *
 * Produced files:
 *   package.json, tsconfig.json, vite.config.ts, index.html, src/main.tsx,
 *   src/App.tsx, src/routes.tsx, src/theme/ThemeProvider.tsx, empty src/screens/,
 *   empty src/fixtures/, empty src/custom/.
 *
 * Does NOT generate screens themselves — the developer agent does that after.
 *
 * TODO(M3): implement template rendering + adapter-aware theme-provider generation.
 */
export {};
// TODO: implement.
