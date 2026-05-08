# Troubleshooting

Common failures and concrete fixes. See `src/monolith/QUICKSTART.md § Troubleshooting` for the short list; this file is the long version.

## Setup

### `tsx` not found / scripts won't run
```
npm install
```
Run from the skill root (`src/monolith/` or, after sync, the editor's `.editor/skills/monolith/`). `tsx` is a dependency.

### TypeScript compile errors after pulling
```
npm run typecheck
```
If errors point at agent or scratchpad paths, you may have a stale state file from an older version. Delete `.monolith/state.json` and re-run.

### `node sync-skills.js` reports differences
Expected — you edited `src/monolith/` and the editor folders are out of date. Run sync, commit both `src/` and the synced folders.

## Triage / G1

### "DS source missing" but I provided one
- Adapter path resolves? Try absolute path.
- MCP name matches a reachable server? Verify in your editor's MCP config.
- For `both:`, both must resolve.

### "Guideline source missing"
Pass `Guidelines: auto` to fall back to inference from the DS index.

### G1 won't proceed even with `unresolved[] = []`
Make sure you replied `ok` / `proceed` / `yes`. Free-text like "looks fine" is rejected (per `rules/approval-gate-rules.md`).

## Discovery / cacheable phases

### Cache miss when I expected a hit
Check `state.phases.<name>.fingerprint`. Inputs that change the fingerprint:
- DS: adapter file mtime, repo HEAD commit, MCP version.
- Guidelines: source files mtimes, URL content hash.
- Research: brief + market-research.md hashes.
Force the cache aside with `--no-cache` or delete `.monolith/cache/<tier>/`.

### Cache hit when I expected a miss
You changed something the fingerprint doesn't track (e.g., environment variable). Use `--refresh-<tier>` or `--no-cache`.

### `index-ds-repo.ts` crashes inside `ts-morph`
Adapter's `propTypes.tsconfig` must point at a real `tsconfig.json`. Verify the path and that the file parses.

### Market researcher produces only "Adjacent-market" content
The brief's space is genuinely novel, OR web tools weren't available. If you have web access, ensure the agent has it. Otherwise expect inference-tagged claims.

## Planning / G2

### G2 yield message appears but I get no chance to edit
You're running `--lazy` and the orchestrator auto-`continue`d. Re-run without `--lazy` to interact.

### I edited a scratchpad file but the phase didn't re-run
`scripts/scratchpad-lifecycle.ts detect-edits` compares against `state.artifacts.<name>.lastModified`. If the timestamp didn't change, edits aren't seen. Save the file (force a real mtime change) and reply `continue` again, or use `iterate on <doc>: <delta>` to be explicit.

### Planning review file missing
`tsx scripts/render-planning-review.ts --state .monolith/state.json` must run before G2. Check `state.healLog` for errors.

## Code generation

### `npm install` fails in the generated app
- Unknown package → DS adapter referenced a package that doesn't exist on npm. Fix the adapter.
- Peer-dep conflict → developer auto-falls-back to `--legacy-peer-deps` and notes it. If still failing, open the error and resolve manually.

### Build fails after developer full-gen
Read the error. Common causes:
- DS_FIRST violation: developer used a raw HTML primitive. The validator names the file/line.
- Token-typed string: a `theme-spec.json § bridge` value didn't render correctly. Check the bridge kind.

### Dev server boots but page is blank
- Open browser devtools console. Often a missing fixture or import.
- `<runRoot>/qa/dev_qa_report.md § SERVER` carries server-side errors.

## QA loop

### Same issue keeps appearing across iterations
The developer's previous patch did not address it. If the heal log shows `patchDidNotResolve: true`, it's the developer's diagnosis — read it. Otherwise raise as a self-healer scope issue.

### Iteration cap hit (5 attempts)
The orchestrator escalates with the unresolved issues in `DELIVERY.md § Blockers`. Either:
- `iterate on <stage>: <delta>` at G3 with a more specific instruction, or
- Accept with `log` (mark as known-incomplete) — only if available in your version.

### Playwright won't install
`scripts/resolve-browser.ts` should fall back to system browsers. Install Chrome/Chromium/Edge, or set `PLAYWRIGHT_CHROMIUM_PATH` to an existing binary. As a last resort: `npx playwright install chromium`.

### Dev server died mid-QA
The orchestrator detects via healthcheck and auto-restarts. If it can't, check `state.server.status` — if `crashed`, manually run `npm run dev` in `<appRoot>` to see the error.

### Port conflict on dev server boot
Vite picks a free port automatically. If you see "EADDRINUSE", another process holds the port. Stop it or change `state.server.url` in state and restart.

## Delivery / G3

### `accept` doesn't archive scratchpad
Check `tsx scripts/scratchpad-lifecycle.ts archive --runId <id> --state .monolith/state.json` ran. If not, the orchestrator hit an error — see chat output.

### Localhost URL returns 404 for a route
Run `runtime-inspector` again on the route. The unified QA loop should have caught it; if it's missing, verify `runtime-sweep.ts` is wired to the patchManifest.

## Context compaction / session lost mid-run

### The AI stopped following the pipeline and started writing code directly

This is the context compaction failure mode. When the conversation hits context limits, the session summary replaces the live pipeline state with plain text like "The build is approximately 40% complete." The AI reads this as a task handoff and writes code directly.

**What should happen automatically (v3.4+):**
The orchestrator's pre-flight check reads `.monolith/state.json` and auto-resumes if it finds `status === "in-progress"`. You should see `[CONTEXT RECOVERY DETECTED]` in the output.

**If auto-recovery didn't trigger:**
1. Look for `.monolith/RESUME.md` — it contains the runId and last active phase.
2. Invoke the skill explicitly: `/monolith --resume <runId>`
3. The orchestrator will re-display the gate message or continue from the last completed phase.

**If `.monolith/RESUME.md` is missing but `state.json` exists:**
The run was on an older version without Rule 27. Resume manually:
1. Open `.monolith/state.json`.
2. Find `state.meta.runId` and the last phase with `"status": "done"`.
3. Invoke: `/monolith --resume <runId>`

**If both files are missing:**
The run cannot be resumed. Start fresh.

### I resumed but the orchestrator re-ran phases that were already done

`state.phases.<name>.status` for those phases should be `"done"`. If it's `"pending"` or `"active"`, those phases re-run as designed. Check `state.json` to confirm — the phase with `"status": "active"` when context was lost will re-run from scratch (intended: mid-execution state can't be partially recovered).

### The per-turn footer `[PIPELINE: ...]` is missing from orchestrator output

The orchestrator is not following Rule 27. File an issue — the footer is required on every turn and must not be omitted even at gates.

## Resume

### `--resume <runId>` does nothing
- `state.json` must exist with `state.meta.runId == <runId>`.
- Some scratchpad files must still be present (resume verifies before continuing).
- If a phase was edited mid-pause, that phase + downstream re-run.

## State / cache

### `state.json` corrupted (parse error)
The state-manager validates with zod and writes atomically. If the file is corrupt:
- Last `.monolith/state.json.bak` (if your version writes one) is the recovery.
- Otherwise reconstruct: re-run from the last completed phase (its outputs in scratchpad still exist).

### `.monolith/cache/` getting huge
LRU eviction triggers over 1GB. To force-clear: delete the cache dir. Will re-populate on next run.

## Sharing the skill with someone else

1. Have them `git clone` this repo.
2. `npm install` (skill root).
3. Their AI editor auto-discovers via `.claude/skills/monolith/`, `.cursor/skills/monolith/`, etc.
4. They follow `src/monolith/QUICKSTART.md`.

If the editor doesn't auto-discover, manually copy `src/monolith/` into the editor's skills directory or run `node sync-skills.js`.
