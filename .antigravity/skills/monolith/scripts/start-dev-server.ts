#!/usr/bin/env tsx
/**
 * start-dev-server.ts — Boot the generated Vite app; return URL + PID.
 *
 * USAGE:
 *   tsx scripts/start-dev-server.ts --app out/<runId>/app/ [--timeout 60]
 *
 * Spawns `npm run dev` in the app dir, captures stdout until Vite prints the
 * `Local:` URL, then returns { url, pid } as JSON on stdout.
 *
 * If the server doesn't reach HTTP 200 on /  within --timeout seconds, kill the
 * process and exit 1 with the captured stderr.
 *
 * Port handling: Vite picks the next available port when 5173 is taken. The
 * script does NOT override; it parses whatever Vite reports.
 *
 * The server stays alive after the script exits (detached). The orchestrator
 * is responsible for eventually terminating it (usually: never — user closes).
 *
 * TODO(M3): implement spawn + log-grep + healthcheck.
 */
export {};
// TODO: implement.
