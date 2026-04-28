#!/usr/bin/env tsx
/**
 * render-planning-review.ts — Condense all planning artifacts into one review doc.
 *
 * USAGE:
 *   tsx scripts/render-planning-review.ts --state .monolith/state.json --out .monolith/scratchpad/PLANNING_REVIEW.md
 *
 * Reads artifact summaries from state.json. Does NOT read full markdown files.
 */

import fs from 'fs';
import path from 'path';
import { StateManager } from './state-manager.js';

function main() {
  const statePath = process.argv.includes('--state')
    ? process.argv[process.argv.indexOf('--state') + 1]
    : '.monolith/state.json';
  const outPath = process.argv.includes('--out')
    ? process.argv[process.argv.indexOf('--out') + 1]
    : '.monolith/scratchpad/PLANNING_REVIEW.md';

  const sm = new StateManager(statePath);
  const state = sm.readState();
  if (!state) {
    console.error('No state found');
    process.exit(1);
  }

  const meta = state.meta || {};
  const artifacts = state.artifacts || {};
  const phases = state.phases || {};

  const lines: string[] = [];
  lines.push(`# Planning Review — ${meta.runId || 'unknown'}`);
  lines.push('');
  lines.push(`> **Status:** ${meta.status || 'unknown'}`);
  lines.push(`> **Started:** ${meta.startedAt || 'unknown'}`);
  lines.push('');

  // Brief
  lines.push('## Brief');
  lines.push(state.input?.manifest?.brief || 'N/A');
  lines.push('');

  // Progress
  lines.push('## Progress');
  const phaseEntries = Object.entries(phases);
  const done = phaseEntries.filter(([, v]: [string, any]) => v.status === 'done' || v.status === 'skipped').length;
  lines.push(`${done}/${phaseEntries.length} phases complete`);
  lines.push('');
  lines.push('| Phase | Status |');
  lines.push('|---|---|');
  for (const [name, data] of phaseEntries) {
    lines.push(`| ${name} | ${(data as any).status} |`);
  }
  lines.push('');

  // Artifacts summary
  lines.push('## Artifacts');
  lines.push('');
  for (const [name, meta] of Object.entries(artifacts)) {
    const m = meta as any;
    lines.push(`### ${name}`);
    lines.push(`- **Path:** ${m.fullPath || 'N/A'}`);
    lines.push(`- **Tokens:** ${m.tokenCount || 'N/A'}`);
    lines.push(`- **Version:** ${m.version || 1}`);
    lines.push(`- **Summary:** ${m.summary || 'N/A'}`);
    lines.push('');
  }

  // Open questions
  lines.push('## Open Questions');
  lines.push('(To be filled by product-manager or ux-strategist)');
  lines.push('');

  // Next steps
  lines.push('## Next Steps');
  lines.push('Reply to the orchestrator with:');
  lines.push('- `continue` — proceed to code generation');
  lines.push('- `iterate on <doc>: <delta>` — update a specific doc');
  lines.push('- `restart from <phase>` — restart from that phase');
  lines.push('- `abort` — stop the run');
  lines.push('');

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join('\n'), 'utf-8');
  console.log(`Planning review written to ${outPath}`);
}

main();
