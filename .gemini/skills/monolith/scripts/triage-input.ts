#!/usr/bin/env tsx
/**
 * triage-input.ts — Stage 0 classifier.
 *
 * USAGE:
 *   tsx scripts/triage-input.ts \
 *     --brief "<verbatim brief>" \
 *     [--ds-mcp <mcp-name>] [--ds-repo <path>] [--ds-adapter <path>] \
 *     [--guidelines-files <csv>] [--guidelines-url <url>] \
 *     [--theme light|dark|both] [--density compact|comfortable|spacious] \
 *     [--locale en-US] \
 *     --out out/<runId>/input-manifest.json
 *
 * Emits an input-manifest.json matching guidelines-schema/input-manifest.schema.json.
 * Fills `unresolved[]` with concrete questions if classification is ambiguous.
 *
 * TODO(M1): implement the shape detection heuristics from plan.md §4.
 *   - DS source: check MCP reachability; check repo path + adapter file existence.
 *   - Guidelines source: check provided files; HEAD the URL; walk the repo for docs.
 *   - Prompt type: simple regex on verbs ("build a <screen>" vs "<product>").
 *   - Constraints: defaults from plan.md §4.3.
 *   - Derive runId: `<YYYY-MM-DD>_<kebab-brief-slug>`.
 */
export {};
// TODO: implement.
