#!/usr/bin/env tsx
/**
 * start-dev-server.ts — Boot Vite dev server via programmatic API.
 *
 * USAGE:
 *   tsx scripts/start-dev-server.ts --app-root ./my-app [--timeout 60]
 *
 * Uses Vite's createServer() instead of spawning npm run dev.
 * Server lifecycle is bound to this script process.
 */

import fs from 'fs';
import path from 'path';

let server: any = null;

async function main() {
  const appRoot = process.argv.includes('--app-root')
    ? process.argv[process.argv.indexOf('--app-root') + 1]
    : '.';
  const timeoutMs = parseInt(
    process.argv.includes('--timeout') ? process.argv[process.argv.indexOf('--timeout') + 1] : '60000',
    10
  );
  const statePath = process.argv.includes('--state')
    ? process.argv[process.argv.indexOf('--state') + 1]
    : '.monolith/state.json';

  const absAppRoot = path.resolve(appRoot);

  if (!fs.existsSync(absAppRoot)) {
    console.error(`App root not found: ${absAppRoot}`);
    process.exit(1);
  }

  // Use shared cache dir for faster warm-up across runs
  const cacheDir = path.resolve('.monolith/cache/vite');
  fs.mkdirSync(cacheDir, { recursive: true });

  // @ts-ignore vite is a devDependency of the scaffolded app, not this package
  const vite = await import('vite');
  server = await vite.createServer({
    root: absAppRoot,
    cacheDir,
    server: {
      port: 5173,
      strictPort: false,
    },
    logLevel: 'error',
  });

  await server.listen();
  const urls = server.resolvedUrls;
  const url = urls?.local?.[0] || 'http://localhost:5173';

  // Write state
  const { StateManager } = await import('./state-manager.js');
  const sm = new StateManager(statePath);
  sm.setServerState(process.pid, url, 'running');

  console.log(JSON.stringify({ url, pid: process.pid, status: 'running' }));

  // Healthcheck loop
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status === 200) {
        console.error(`Server ready at ${url}`);
        return;
      }
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  console.error(`Server failed to respond within ${timeoutMs}ms`);
  await server.close();
  process.exit(1);
}

// Graceful shutdown
process.on('SIGINT', async () => {
  if (server) await server.close();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  if (server) await server.close();
  process.exit(0);
});

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
