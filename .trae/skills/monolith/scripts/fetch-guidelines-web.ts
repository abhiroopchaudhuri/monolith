#!/usr/bin/env tsx
/**
 * fetch-guidelines-web.ts — Crawl a DS guidelines website into the seven topic docs.
 *
 * USAGE:
 *   tsx scripts/fetch-guidelines-web.ts --url <root-url> --out <dir>/guidelines/
 *
 * This script uses the WebFetch tool (via MCP or equivalent) to retrieve pages.
 * It then classifies paragraphs per the seven canonical topics in plan.md §6.1.
 *
 * Output:
 *   <dir>/guidelines/<topic>.md  + <topic>.json  (one per topic, or "insufficient
 *   evidence — see fallback" when confidence < 0.6)
 *
 * Cache:
 *   .cache/guidelines/<domain>/<sha-of-url>.json
 *   Cache is valid for 7d unless --no-cache passed.
 *
 * Constraints:
 *   - Respect robots.txt.
 *   - No more than N pages per domain (default 30).
 *   - Preserve source-quote attributions in the emitted docs.
 *
 * TODO(M1): implement crawl + topic classifier (Sonnet-prompted).
 */
export {};
// TODO: implement.
