#!/usr/bin/env tsx
/**
 * visual-smoke.ts — Playwright screenshot per route; basic structure diff vs plan.
 *
 * USAGE:
 *   tsx scripts/visual-smoke.ts \
 *     --url http://localhost:5173 \
 *     --plan out/<runId>/docs/screen-plan.json \
 *     --out out/<runId>/qa/screenshots/
 *
 * For each screen in plan:
 *   1. Navigate to its route.
 *   2. Wait for network idle + landmark presence.
 *   3. Screenshot full viewport at the planned theme + density.
 *   4. Count sections (by data-section attribute OR by the plan's section IDs).
 *   5. Warn if section count mismatches.
 *
 * Output:
 *   screenshots/<screen-id>.png
 *   screenshots/<screen-id>.meta.json  (counts, landmarks found, load time)
 *
 * TODO(M4): implement.
 */
export {};
// TODO: implement.
