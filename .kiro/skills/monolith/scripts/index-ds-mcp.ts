#!/usr/bin/env tsx
/**
 * index-ds-mcp.ts — Build the DS knowledge pack from an MCP server.
 *
 * USAGE:
 *   tsx scripts/index-ds-mcp.ts --mcp <mcp-name> --out <dir>
 *
 * Queries the MCP for component catalog, tokens, and icons.
 * Normalizes to the same shapes index-ds-repo.ts produces.
 */

import fs from 'fs';
import path from 'path';

async function queryMcp(mcpName: string, method: string, params?: any): Promise<any> {
  // Placeholder: actual MCP querying requires the MCP client/runtime.
  // This script documents the contract and provides a fallback.
  console.warn(`MCP query not available in standalone mode: ${mcpName}.${method}`);
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const mcpName = getArg('--mcp');
  const outDir = getArg('--out');

  if (!mcpName || !outDir) {
    console.error('Usage: tsx scripts/index-ds-mcp.ts --mcp <name> --out <dir>');
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });

  try {
    const catalog = await queryMcp(mcpName, 'getComponentCatalog');
    const components = catalog?.components ?? [];
    const componentIndex = {
      source: 'mcp',
      mcp: mcpName,
      generatedAt: new Date().toISOString(),
      components: components.map((c: any) => ({
        name: c.name,
        importPath: c.importPath || mcpName,
        props: c.props ?? [],
        variants: c.variants ?? [],
        slots: c.slots ?? [],
        a11y: c.a11y ?? [],
        examples: c.examples ?? [],
        tokensUsed: c.tokensUsed ?? [],
      })),
    };

    fs.writeFileSync(path.join(outDir, 'component-index.json'), JSON.stringify(componentIndex, null, 2), 'utf-8');
    console.log(`Indexed ${components.length} components from MCP ${mcpName}`);
  } catch (e: unknown) {
    console.error('MCP query failed:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  }

  // Tokens and icons would be queried similarly
  console.log('Note: token/icon extraction from MCP should be implemented when MCP runtime is available.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
