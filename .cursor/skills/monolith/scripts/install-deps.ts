#!/usr/bin/env tsx
/**
 * install-deps.ts — npm install in the scaffolded app.
 *
 * USAGE:
 *   tsx scripts/install-deps.ts --app <runRoot>/app/ [--timeout 300]
 *
 * Runs `npm install` in the app dir. Fails loudly on peer-dep conflicts,
 * network errors, or disk issues.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function main() {
  const args = process.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const appDir = getArg('--app');
  const timeoutSec = parseInt(getArg('--timeout') ?? '300', 10);

  if (!appDir) {
    console.error('Usage: tsx scripts/install-deps.ts --app <dir>');
    process.exit(1);
  }

  if (!fs.existsSync(path.join(appDir, 'package.json'))) {
    console.error(`No package.json found in ${appDir}`);
    process.exit(1);
  }

  console.log(`Installing dependencies in ${appDir}...`);

  try {
    execSync('npm install', {
      cwd: appDir,
      stdio: 'inherit',
      timeout: timeoutSec * 1000,
    });
    console.log('Dependencies installed successfully.');
  } catch (err: any) {
    const stderr = err.stderr?.toString?.() ?? '';
    const stdout = err.stdout?.toString?.() ?? '';
    const output = `${stdout}\n${stderr}`;

    if (output.includes('ERESOLVE') || output.includes('peer dep')) {
      console.error('\n[FAIL] Peer dependency conflict detected.');
      console.error(output);
      process.exit(4);
    }
    if (output.includes('ECONNREFUSED') || output.includes('ENOTFOUND') || output.includes('ETIMEDOUT')) {
      console.error('\n[FAIL] Network error during npm install.');
      console.error('Suggestion: check your connection, or use an offline mirror (npm config set registry ...)');
      process.exit(2);
    }
    if (output.includes('ENOSPC')) {
      console.error('\n[FAIL] Disk full (ENOSPC).');
      process.exit(3);
    }
    if (output.includes('EACCES') || output.includes('EPERM')) {
      console.error('\n[FAIL] Permission denied during install.');
      process.exit(3);
    }

    console.error('\n[FAIL] npm install failed:');
    console.error(output || err.message);
    process.exit(1);
  }
}

main();
