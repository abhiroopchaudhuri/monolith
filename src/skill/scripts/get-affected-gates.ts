#!/usr/bin/env tsx
/**
 * get-affected-gates.ts — Map a patch manifest to affected QA gates.
 *
 * USAGE:
 *   tsx scripts/get-affected-gates.ts --manifest '{"changeType":"css","touchedFiles":["src/theme.css"]}'
 *
 * Returns JSON array of gate names to run.
 */

import { PatchManifest } from './state-manager.js';

const gateMap: Record<string, string[]> = {
  logic: ['dev-qa', 'production-readiness', 'runtime-inspector'],
  css: ['design-qa', 'visual-smoke'],
  routing: ['dev-qa', 'runtime-inspector'],
  copy: ['design-qa', 'commercial-auditor'],
  form: ['runtime-inspector', 'production-readiness'],
  modal: ['runtime-inspector', 'production-readiness'],
  layout: ['runtime-inspector', 'design-qa'],
};

function getAffectedGates(manifest: PatchManifest): string[] {
  const gates = new Set<string>(gateMap[manifest.changeType] || []);

  // Conservative override: css + .tsx → add logic gates
  if (manifest.changeType === 'css') {
    const hasTsx = manifest.touchedFiles.some((f) => f.endsWith('.tsx'));
    if (hasTsx) {
      gateMap.logic.forEach((g) => gates.add(g));
    }
  }

  // Conservative override: routing changes always include nav-state
  if (manifest.changeType === 'routing') {
    gates.add('runtime-inspector');
  }

  return Array.from(gates);
}

function main() {
  const manifestIdx = process.argv.indexOf('--manifest');
  if (manifestIdx === -1) {
    console.error('Usage: tsx get-affected-gates.ts --manifest \'<json>\'');
    process.exit(1);
  }
  const manifest: PatchManifest = JSON.parse(process.argv[manifestIdx + 1]);
  const gates = getAffectedGates(manifest);
  console.log(JSON.stringify(gates));
}

main();
