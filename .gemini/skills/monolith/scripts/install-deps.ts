#!/usr/bin/env tsx
/**
 * install-deps.ts — npm install in the scaffolded app.
 *
 * USAGE:
 *   tsx scripts/install-deps.ts --app out/<runId>/app/ [--timeout 300]
 *
 * Runs `npm install` in the app dir. Streams stderr. Fails loudly on:
 *   - peer-dep conflicts (extract names + versions into stderr summary)
 *   - network errors (exit 2, message user to retry or use offline mirror)
 *   - ENOSPC / permission errors (exit 3)
 *
 * TODO(M3): implement. Keep it dumb — no npm-wizardry. Just install and report.
 */
export {};
// TODO: implement.
