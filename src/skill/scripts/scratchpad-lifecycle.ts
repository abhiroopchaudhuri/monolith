#!/usr/bin/env tsx
/**
 * scratchpad-lifecycle.ts — Manage scratchpad for turn-based gates.
 *
 * USAGE:
 *   tsx scripts/scratchpad-lifecycle.ts <subcommand> [options]
 *
 * Subcommands:
 *   archive --runId <id> [--state <path>]
 *     → Copy scratchpad files to .monolith/archive/<runId>/
 *   clear [--state <path>]
 *     → Remove all files from scratchpad/
 *   detect-edits [--state <path>]
 *     → Compare scratchpad file mtimes against state.artifacts registry
 *   status [--state <path>]
 *     → List scratchpad files with sizes and mtimes
 */

import fs from 'fs';
import path from 'path';
import { StateManager } from './state-manager.js';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function cmdArchive(runId: string, sm: StateManager) {
  const archiveDir = sm.archiveScratchpad(runId);
  console.log(`Archived scratchpad to ${archiveDir}`);
}

function cmdClear(sm: StateManager) {
  sm.clearScratchpad();
  console.log('Scratchpad cleared.');
}

function cmdDetectEdits(sm: StateManager) {
  const dirty = sm.detectUserEdits();
  if (dirty.length === 0) {
    console.log('No user edits detected.');
    process.exit(0);
  }
  console.log(`User edits detected in ${dirty.length} artifact(s):`);
  for (const name of dirty) {
    console.log(`  - ${name}`);
  }
  process.exit(2); // exit 2 = edits detected, distinct from error
}

function cmdStatus(sm: StateManager) {
  const dir = sm.getScratchpadDir();
  if (!fs.existsSync(dir)) {
    console.log('Scratchpad directory does not exist.');
    return;
  }
  const entries = fs.readdirSync(dir);
  if (entries.length === 0) {
    console.log('Scratchpad is empty.');
    return;
  }
  console.log(`Scratchpad: ${dir}`);
  console.log('─'.repeat(60));
  for (const entry of entries.sort()) {
    const fp = path.join(dir, entry);
    const stat = fs.statSync(fp);
    console.log(`${entry.padEnd(40)} ${formatSize(stat.size).padStart(8)}  ${stat.mtime.toISOString()}`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const subcommand = args[0];

  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const statePath = getArg('--state') || '.monolith/state.json';
  const sm = new StateManager(statePath);

  switch (subcommand) {
    case 'archive': {
      const runId = getArg('--runId');
      if (!runId) {
        console.error('Usage: tsx scripts/scratchpad-lifecycle.ts archive --runId <id>');
        process.exit(1);
      }
      cmdArchive(runId, sm);
      break;
    }
    case 'clear':
      cmdClear(sm);
      break;
    case 'detect-edits':
      cmdDetectEdits(sm);
      break;
    case 'status':
      cmdStatus(sm);
      break;
    default:
      console.error('Unknown subcommand. Use: archive | clear | detect-edits | status');
      process.exit(1);
  }
}

main();
