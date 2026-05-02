#!/usr/bin/env tsx
/**
 * run-phase.ts — Fingerprint-based phase runner with cache skip.
 *
 * USAGE (manual):
 *   tsx scripts/run-phase.ts \
 *     --phase <phase-name> \
 *     --inputs <csv-of-files> \
 *     --cmd "tsx scripts/some-script.ts --arg1 val1" \
 *     --output <outputFileOrDir> \
 *     --state .monolith/state.json
 *
 * USAGE (auto — derives inputs/outputs from state manifest):
 *   tsx scripts/run-phase.ts \
 *     --phase <phase-name> \
 *     --auto \
 *     --state .monolith/state.json
 *
 * USAGE (record fingerprint after agent completes):
 *   tsx scripts/run-phase.ts \
 *     --phase <phase-name> \
 *     --auto \
 *     --record \
 *     --state .monolith/state.json
 *
 * Behavior:
 *   1. Compute input fingerprint from the content of --inputs files.
 *   2. Check state.phases.<phase>.fingerprint.
 *   3. If match AND output exists → skip, mark phase skipped, exit 0.
 *   4. If no match → run --cmd (or auto-derived command).
 *   5. On success → compute output fingerprint, store both, mark phase done.
 *   6. On failure → mark phase failed, exit 1.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { StateManager } from './state-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Hash helpers
// ---------------------------------------------------------------------------

function hashFiles(files: string[]): string {
  const hash = crypto.createHash('sha256');
  for (const f of files.sort()) {
    if (fs.existsSync(f)) {
      hash.update(fs.readFileSync(f, 'utf-8'));
    } else {
      hash.update(`MISSING:${f}`);
    }
  }
  return hash.digest('hex').slice(0, 16);
}

function hashDir(dir: string): string {
  const hash = crypto.createHash('sha256');
  function walk(current: string) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else hash.update(fs.readFileSync(full, 'utf-8'));
    }
  }
  walk(dir);
  return hash.digest('hex').slice(0, 16);
}

function hashOutput(outputPath: string): string {
  if (!fs.existsSync(outputPath)) return '';
  const stat = fs.statSync(outputPath);
  if (stat.isDirectory()) return hashDir(outputPath);
  return crypto.createHash('sha256').update(fs.readFileSync(outputPath, 'utf-8')).digest('hex').slice(0, 16);
}

// ---------------------------------------------------------------------------
// Auto-registry: derives inputs/outputs/cmd from state.manifest
// ---------------------------------------------------------------------------

interface PhaseConfig {
  inputs: (state: any, runRoot: string) => string[];
  output: (state: any, runRoot: string) => string;
  cmd: (state: any, runRoot: string) => string[];
}

const AUTO_REGISTRY: Record<string, PhaseConfig> = {
  dsIndexer: {
    inputs: (state, runRoot) => {
      const adapter = state.input?.manifest?.ds?.adapter;
      const repo = state.input?.manifest?.ds?.repo;
      const files: string[] = [];
      if (adapter) files.push(path.resolve(adapter));
      if (repo) files.push(path.resolve(repo));
      return files.length ? files : [path.join(runRoot, 'ds-knowledge')];
    },
    output: (_state, runRoot) => path.join(runRoot, 'ds-knowledge', 'component-index.json'),
    cmd: (state, runRoot) => {
      const adapter = state.input?.manifest?.ds?.adapter;
      const out = path.join(runRoot, 'ds-knowledge');
      if (adapter) {
        return ['tsx', path.join(__dirname, 'index-ds-repo.ts'), '--adapter', adapter, '--out', out];
      }
      return ['tsx', path.join(__dirname, 'index-ds-repo.ts'), '--out', out];
    },
  },
  guidelinesResolver: {
    inputs: (state, runRoot) => {
      const sources = state.input?.manifest?.guidelines?.sources || [];
      const files: string[] = [];
      for (const s of sources) {
        if (s.startsWith('file:')) files.push(path.resolve(s.slice(5)));
      }
      return files.length ? files : [path.join(runRoot, 'guidelines')];
    },
    output: (_state, runRoot) => path.join(runRoot, 'guidelines'),
    cmd: (_state, runRoot) => {
      return ['echo', 'guidelines-resolver is agent-driven; no standalone script. Use manual mode.'];
    },
  },
  marketResearcher: {
    inputs: (state, runRoot) => {
      const brief = state.input?.manifest?.brief || '';
      const brand = path.join(runRoot, 'guidelines', 'brand.md');
      return fs.existsSync(brand) ? [brand] : [];
    },
    output: (_state, runRoot) => path.join(runRoot, 'docs', 'market-research.md'),
    cmd: (_state, runRoot) => {
      return ['echo', 'market-researcher is agent-driven; no standalone script. Use manual mode.'];
    },
  },
  themingResolver: {
    inputs: (_state, runRoot) => {
      const tokens = path.join(runRoot, 'ds-knowledge', 'tokens.json');
      return fs.existsSync(tokens) ? [tokens] : [];
    },
    output: (_state, runRoot) => path.join(runRoot, 'theme-spec.json'),
    cmd: (_state, runRoot) => {
      return ['echo', 'theming-resolver is agent-driven; no standalone script. Use manual mode.'];
    },
  },
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };
  const hasFlag = (flag: string): boolean => args.includes(flag);

  const phase = getArg('--phase');
  const auto = hasFlag('--auto');
  const record = hasFlag('--record');
  const statePath = getArg('--state') || '.monolith/state.json';

  if (!phase) {
    console.error('Usage: tsx scripts/run-phase.ts --phase <name> [--auto] [--record] [--inputs <files>] [--cmd "..."] [--output <path>] [--state <path>]');
    console.error('  --auto: derive inputs/outputs from state.input.manifest (for supported phases)');
    console.error('  --record: store fingerprint without running a command (use after agent-driven phase)');
    console.error('  Manual mode requires --inputs, --cmd, and --output');
    process.exit(1);
  }

  const sm = new StateManager(statePath);
  const state = sm.readState() || {};
  const runRoot = state.input?.manifest?.paths?.runRoot || process.cwd();

  let inputsRaw: string | undefined = getArg('--inputs');
  let outputPath: string | undefined = getArg('--output');
  let cmdParts: string[] | undefined;

  if (auto) {
    const config = AUTO_REGISTRY[phase];
    if (!config) {
      console.error(`[run-phase] Phase "${phase}" is not supported in --auto mode. Use manual mode with --inputs, --cmd, --output.`);
      process.exit(1);
    }
    const inputFiles = config.inputs(state, runRoot);
    inputsRaw = inputFiles.join(',');
    outputPath = config.output(state, runRoot);
    cmdParts = config.cmd(state, runRoot);
    console.log(`[run-phase] Auto mode for ${phase}: inputs=${inputFiles.length}, output=${outputPath}`);
  } else {
    const cmd = getArg('--cmd');
    if (!inputsRaw || !cmd || !outputPath) {
      console.error('[run-phase] Manual mode requires --inputs, --cmd, and --output');
      process.exit(1);
    }
    cmdParts = cmd.split(/\s+/);
  }

  // Resolve inputs
  let inputFiles: string[];
  if (inputsRaw && fs.existsSync(inputsRaw) && fs.statSync(inputsRaw).isDirectory()) {
    inputFiles = [inputsRaw];
  } else {
    inputFiles = (inputsRaw || '').split(',').map((f) => f.trim()).filter(Boolean);
  }

  // Compute input fingerprint
  const inputHash = inputFiles.length === 1 && fs.existsSync(inputFiles[0]) && fs.statSync(inputFiles[0]).isDirectory()
    ? hashDir(inputFiles[0])
    : hashFiles(inputFiles);

  // Check cache
  const { match, storedHash } = sm.checkFingerprint(phase, inputHash);
  const outputExists = outputPath ? fs.existsSync(outputPath) : false;
  const storedOutputHash = state.phases?.[phase]?.outputHash;
  const currentOutputHash = outputExists && outputPath ? hashOutput(outputPath) : '';

  if (match && outputExists && storedOutputHash === currentOutputHash && !record) {
    console.log(`[run-phase] ${phase}: CACHE HIT (fingerprint ${inputHash}). Skipping.`);
    sm.setPhaseStatus(phase, 'skipped', { reason: 'cache_hit', fingerprint: inputHash });
    process.exit(0);
  }

  // Record mode: just store the fingerprint without running anything
  if (record) {
    const newOutputHash = outputPath ? hashOutput(outputPath) : '';
    sm.setFingerprint(phase, inputHash, newOutputHash);
    sm.setPhaseStatus(phase, 'done', { fingerprint: inputHash, outputHash: newOutputHash, recorded: true });
    console.log(`[run-phase] ${phase}: RECORDED fingerprint ${inputHash}, output ${newOutputHash}`);
    process.exit(0);
  }

  console.log(`[run-phase] ${phase}: CACHE MISS (fingerprint ${inputHash}, stored ${storedHash || 'none'}). Running...`);
  sm.setPhaseStatus(phase, 'active');

  // If auto mode and the command is just an echo (agent-driven phase), we can't auto-run.
  // In that case, exit with a special code (2) meaning "cache miss, but needs agent invocation".
  if (auto && cmdParts && cmdParts[0] === 'echo') {
    console.log(`[run-phase] ${phase}: Agent-driven phase — invoke the agent, then re-run with --record to store fingerprint.`);
    sm.setPhaseStatus(phase, 'pending', { reason: 'agent_driven_needs_manual_run' });
    process.exit(2);
  }

  try {
    if (!cmdParts || cmdParts.length === 0) {
      throw new Error('No command to run');
    }
    execFileSync(cmdParts[0], cmdParts.slice(1), { stdio: 'inherit', timeout: 600000 });

    if (outputPath && !fs.existsSync(outputPath)) {
      console.error(`[run-phase] ${phase}: Command succeeded but output not found at ${outputPath}`);
      sm.setPhaseStatus(phase, 'failed', { reason: 'missing_output' });
      process.exit(1);
    }

    const newOutputHash = outputPath ? hashOutput(outputPath) : '';
    sm.setFingerprint(phase, inputHash, newOutputHash);
    sm.setPhaseStatus(phase, 'done', { fingerprint: inputHash, outputHash: newOutputHash });
    console.log(`[run-phase] ${phase}: DONE. Output fingerprint ${newOutputHash}`);
    process.exit(0);
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error(`[run-phase] ${phase}: FAILED.`, errMsg);
    sm.setPhaseStatus(phase, 'failed', { error: errMsg });
    process.exit(1);
  }
}

main();
