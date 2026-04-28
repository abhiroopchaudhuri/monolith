#!/usr/bin/env tsx
/**
 * stop-dev-server.ts — Gracefully kill the dev server.
 *
 * USAGE:
 *   tsx scripts/stop-dev-server.ts [--state .monolith/state.json]
 *
 * Reads PID from state.json and kills the process.
 */

import { execSync } from 'child_process';
import { StateManager } from './state-manager.js';

function main() {
  const statePath = process.argv.includes('--state')
    ? process.argv[process.argv.indexOf('--state') + 1]
    : '.monolith/state.json';

  const sm = new StateManager(statePath);
  const serverState = sm.getServerState();

  if (!serverState || !serverState.pid) {
    console.error('No server PID found in state');
    process.exit(1);
  }

  try {
    // On Windows, use taskkill /T to kill process tree
    // On Unix, try SIGTERM first, then SIGKILL
    if (process.platform === 'win32') {
      execSync(`taskkill /PID ${serverState.pid} /T /F`, { stdio: 'ignore' });
    } else {
      try {
        execSync(`kill -15 ${serverState.pid}`, { stdio: 'ignore' });
      } catch {
        execSync(`kill -9 ${serverState.pid}`, { stdio: 'ignore' });
      }
    }
    sm.setServerState(0, '', 'stopped');
    console.log(`Stopped server PID ${serverState.pid}`);
  } catch (err) {
    console.error(`Failed to stop server: ${err}`);
    process.exit(1);
  }
}

main();
