#!/usr/bin/env tsx
/**
 * index-ds-mcp.ts — Build the DS knowledge pack from an MCP server.
 *
 * USAGE:
 *   tsx scripts/index-ds-mcp.ts --mcp <mcp-name> --out <dir>
 *
 * The script queries the MCP for its component catalog, tokens, and icons, then
 * normalizes to the same shapes index-ds-repo.ts produces. Downstream agents must
 * not be able to tell which source produced the index.
 *
 * Contract per component:
 *   { name, importPath, props[], variants[], slots[], subcomponents[], examples[], a11y }
 *
 * Missing categories emit empty objects + a warning (not a failure), except when
 * a component catalog is empty — that blocks the run.
 *
 * Reconciliation (when invoked in "both" mode): emits only half-records here; the
 * ds-indexer agent does the merge with repo-originated records.
 *
 * TODO(M1): implement MCP discovery + normalized output.
 */
export {};
// TODO: implement.
