#!/usr/bin/env tsx
/**
 * resolve-browser.ts — Find a usable Chromium/Chrome/Edge for Playwright.
 *
 * USAGE:
 *   tsx scripts/resolve-browser.ts
 *
 * Checks in order:
 *   1. PLAYWRIGHT_CHROMIUM_PATH env var
 *   2. Global Playwright cache (~/.cache/ms-playwright/...)
 *   3. System Chrome/Chromium/Edge
 *   4. Fallback: npx playwright install chromium --with-deps --only-shell
 *
 * Exits 0 with path on stdout, or exits 1.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

function findGlobalPlaywrightCache(): string | null {
  const home = os.homedir();
  const candidates: string[] = [];

  if (process.platform === 'win32') {
    candidates.push(path.join(home, 'AppData', 'Local', 'ms-playwright'));
  } else if (process.platform === 'darwin') {
    candidates.push(path.join(home, 'Library', 'Caches', 'ms-playwright'));
  } else {
    candidates.push(path.join(home, '.cache', 'ms-playwright'));
  }

  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue;
    const entries = fs.readdirSync(dir);
    const chromiumDir = entries.find((e) => e.startsWith('chromium-'));
    if (!chromiumDir) continue;

    const binaryNames = process.platform === 'win32'
      ? ['chrome.exe']
      : process.platform === 'darwin'
      ? ['Chromium.app/Contents/MacOS/Chromium', 'chrome-mac/Chromium']
      : ['chrome-linux/chrome', 'chrome'];

    for (const bin of binaryNames) {
      const full = path.join(dir, chromiumDir, bin);
      if (fs.existsSync(full)) return full;
    }
  }
  return null;
}

function findSystemBrowser(): string | null {
  const commands = process.platform === 'win32'
    ? ['where google-chrome', 'where chromium', 'where msedge']
    : process.platform === 'darwin'
    ? [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      ]
    : ['which google-chrome', 'which chromium-browser', 'which chromium', 'which microsoft-edge'];

  for (const cmd of commands) {
    try {
      if (cmd.startsWith('/')) {
        if (fs.existsSync(cmd)) return cmd;
      } else {
        const result = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
        if (result) return result.split('\n')[0];
      }
    } catch {
      // ignore
    }
  }
  return null;
}

function main() {
  // 1. Env var
  if (process.env.PLAYWRIGHT_CHROMIUM_PATH) {
    console.log(process.env.PLAYWRIGHT_CHROMIUM_PATH);
    return;
  }

  // 2. Global cache
  const cached = findGlobalPlaywrightCache();
  if (cached) {
    console.log(cached);
    return;
  }

  // 3. System browser
  const system = findSystemBrowser();
  if (system) {
    console.log(system);
    return;
  }

  // 4. Fallback: install
  console.error('No browser found. Installing Playwright Chromium...');
  try {
    execSync('npx playwright install chromium --with-deps --only-shell', { stdio: 'inherit' });
    const afterInstall = findGlobalPlaywrightCache();
    if (afterInstall) {
      console.log(afterInstall);
      return;
    }
  } catch {
    // fall through
  }

  console.error('Failed to resolve any browser.');
  process.exit(1);
}

main();
