#!/usr/bin/env tsx
/**
 * axe-run.ts — Axe-core accessibility run against every route.
 *
 * USAGE:
 *   tsx scripts/axe-run.ts \
 *     --url http://localhost:5173 \
 *     --routes /,/settings,/patients/:id \
 *     --out out/<runId>/qa/a11y_report.json
 *
 * Boots a headless Chromium via Playwright, visits each route, injects axe-core,
 * and collects the report per route.
 *
 * Failure categories:
 *   - critical → immediate gate failure (reported to dev-qa)
 *   - serious  → reported, not blocking
 *   - moderate/minor → reported
 *
 * Dynamic routes (with :id) need a sample param from fixtures. Script reads
 * fixtures/<screen>.ts for the first available ID; if none, skips with a warning.
 *
 * TODO(M4): implement.
 */
export {};
// TODO: implement.
