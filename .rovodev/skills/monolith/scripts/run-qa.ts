#!/usr/bin/env tsx
/**
 * run-qa.ts — Unified QA loop executor.
 *
 * USAGE:
 *   tsx scripts/run-qa.ts \
 *     --app <appRoot> \
 *     --index <component-index> \
 *     --state .monolith/state.json \
 *     [--iteration 1] \
 *     [--out <qaDir>]
 *
 * Iteration 1 (default): runs ALL gates (full sweep).
 * Iteration 2+: reads patchManifest from state, runs only affected gates.
 *
 * Exit 0 if no blockers. Exit 1 if blockers remain.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { StateManager, PatchManifest } from './state-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GATE_SCRIPTS: Record<string, { script: string; args: string[]; needsServer: boolean }> = {
  'dev-qa': { script: 'validate-generated.ts', args: ['--gates', 'PARSE,IMPORTS,PROPS,ICONS,DS_FIRST,COVERAGE,FIXTURES,AUDIT,ANTI_GENERIC,TOKENS'], needsServer: false },
  'production-readiness': { script: 'validate-generated.ts', args: ['--gates', 'PARSE,DS_FIRST,AUDIT,ANTI_GENERIC'], needsServer: false },
  'runtime-inspector': { script: 'runtime-sweep.ts', args: [], needsServer: true },
  'design-qa': { script: 'visual-smoke.ts', args: [], needsServer: true },
  'commercial-auditor': { script: 'validate-generated.ts', args: ['--gates', 'ANTI_GENERIC,TOKENS'], needsServer: false },
};

function runGate(gate: string, appRoot: string, indexPath: string | undefined, outDir: string, url?: string): any {
  const config = GATE_SCRIPTS[gate];
  if (!config) {
    console.warn(`Unknown gate: ${gate}`);
    return { gate, status: 'skipped', reason: 'unknown_gate', findings: [] };
  }

  const scriptPath = path.resolve(__dirname, config.script);
  const cmdArgs = ['tsx', scriptPath, '--app', appRoot];
  if (indexPath) cmdArgs.push('--index', indexPath);
  if (url) cmdArgs.push('--url', url);
  cmdArgs.push(...config.args);
  const reportPath = path.join(outDir, `${gate}_report.json`);
  cmdArgs.push('--out', reportPath);

  console.log(`[QA] Running ${gate}...`);
  const start = Date.now();

  try {
    execFileSync(cmdArgs[0], cmdArgs.slice(1), { stdio: 'inherit', timeout: 300000 });
    const report = fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, 'utf-8')) : {};
    return {
      gate,
      status: 'passed',
      durationMs: Date.now() - start,
      findings: report.findings || report.issues || [],
      summary: report.summary || {},
    };
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    const report = fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, 'utf-8')) : {};
    return {
      gate,
      status: 'failed',
      durationMs: Date.now() - start,
      findings: report.findings || report.issues || [],
      summary: report.summary || {},
      error: errMsg,
    };
  }
}

function main() {
  const args = process.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const appRoot = getArg('--app');
  const statePath = getArg('--state') || '.monolith/state.json';
  const outDir = getArg('--out') || path.join(appRoot || '.', 'qa');
  const iteration = parseInt(getArg('--iteration') || '1', 10);

  if (!appRoot) {
    console.error('Usage: tsx scripts/run-qa.ts --app <dir> [--state <path>] [--iteration <n>] [--out <dir>]');
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });

  const sm = new StateManager(statePath);
  const state = sm.readState() || {};
  const patchManifest: PatchManifest | undefined = state.input?.lastPatchManifest;

  let gatesToRun: string[];
  if (iteration === 1 || !patchManifest) {
    gatesToRun = Object.keys(GATE_SCRIPTS);
    console.log(`[QA] Iteration ${iteration}: FULL sweep (all gates)`);
  } else {
    gatesToRun = sm.getAffectedGates(patchManifest);
    console.log(`[QA] Iteration ${iteration}: DELTA sweep (affected gates: ${gatesToRun.join(', ')})`);
  }

  const needsServer = gatesToRun.some((g) => GATE_SCRIPTS[g]?.needsServer);
  let serverUrl: string | undefined;
  if (needsServer) {
    const serverState = state.server;
    if (serverState?.url && serverState?.status === 'running') {
      serverUrl = serverState.url;
      console.log(`[QA] Using dev server at ${serverUrl}`);
    } else {
      console.error('[QA] Dev server required but not running. Start it first with start-dev-server.ts');
      process.exit(1);
    }
  }

  const indexPath = state.artifacts?.componentIndex?.fullPath;
  const results: any[] = [];

  for (const gate of gatesToRun) {
    const result = runGate(gate, appRoot, indexPath, outDir, serverUrl);
    results.push(result);
    const issueIds = (result.findings || []).map((f: any) => f.id || `${gate}-${Date.now()}`);
    sm.setQaStatus(gate, result.status, iteration, issueIds);
  }

  const allFindings: any[] = [];
  for (const r of results) {
    if (r.findings) allFindings.push(...r.findings);
  }

  const blockers = allFindings.filter((f: any) => f.severity === 'blocker' || f.gate === 'PARSE');
  const majors = allFindings.filter((f: any) => f.severity === 'major');
  const minors = allFindings.filter((f: any) => f.severity === 'minor');

  const existingOpen: any[] = sm.readState()?.issues?.open || [];
  const unaffectedGateIssues = existingOpen.filter((i: any) => !gatesToRun.includes(i.gate));
  const newIssues = allFindings.map((f: any, idx: number) => ({
    id: f.id || `QA-${iteration}-${idx}`,
    gate: f.gate || 'unknown',
    attempt: iteration,
    severity: f.severity || 'minor',
    category: f.category || f.gate || 'unknown',
    location: f.file ? { file: f.file, line: f.line } : undefined,
    observation: f.issue || f.snippet || 'No description',
    suggestedFix: f.suggestedFix,
  }));
  sm.writeBranch('issues.open', [...unaffectedGateIssues, ...newIssues]);

  sm.addHealEntry('unified-qa', iteration, blockers.length + majors.length + minors.length, patchManifest);

  const summary = {
    iteration,
    gatesRun: gatesToRun,
    findings: { total: allFindings.length, blockers: blockers.length, majors: majors.length, minors: minors.length },
    verdict: blockers.length === 0 ? 'pass' : 'fail',
  };
  fs.writeFileSync(path.join(outDir, `qa-summary-iter-${iteration}.json`), JSON.stringify(summary, null, 2), 'utf-8');

  console.log(`\n[QA] Summary: ${allFindings.length} findings (${blockers.length} blockers, ${majors.length} majors, ${minors.length} minors)`);

  if (blockers.length > 0) {
    console.error('\nBLOCKERS:');
    for (const b of blockers.slice(0, 10)) {
      console.error(`  ${b.gate || b.category} | ${b.file || b.route || '?'}`);
    }
    process.exit(1);
  }

  console.log('[QA] All gates passed.');
}

main();
