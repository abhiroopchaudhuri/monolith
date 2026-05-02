# Monolith — Production Readiness Audit

> **Date:** 2026-05-02
> **Scope:** Audit of `MONOLITH-PERFORMANCE-SOLUTIONS.md`, `MONOLITH-IMPLEMENTATION-PLAN.md`, and `MONOLITH-ZERO-DEPENDENCY-PLAN.md` against the actual repo state.
> **Decision used as ground truth:** the zero-dependency plan (no SQLite, no Git branching, no custom RAG). The original implementation plan's SQLite/Git pieces are intentionally NOT counted as "missing" — they were superseded.
> **Goal:** Make the skill ready to share with others for direct usage.

This file logs **only what is left**. Anything not mentioned here is considered done or intentionally out of scope.

---

## 1. Stale / outdated documentation (high priority — blocks user adoption)

The runtime is largely on v3.3 zero-dependency, but the human-facing docs still describe the v3.0 pipeline. New users will follow the wrong instructions. These all need rewriting against the actual `orchestrator.md` flow.

### 1.1 `src/monolith/user_tutorial.md` — REWRITE
Current state: describes the original linear pipeline and the old invocation template.
Required updates:
- Drop the `--full / --themeOnly / --planOnly / --lazy / --UXR / --noPRD` claim where flags are not actually wired (verify each against `orchestrator.md` and only keep wired ones; otherwise mark "planned").
- Replace `Stop ONLY at G1, G2, G3. … Run every self-healing QA loop to convergence. Spawn subagents as the workflow dictates.` paragraph with the new turn-based model:
  - G1 still blocking.
  - G2 yields a turn — user can edit `.monolith/scratchpad/*.md` and reply `continue` / `iterate on <doc>: <delta>` / `restart from <phase>` / `abort`.
  - G3 yields a turn — `accept` archives scratchpad, `iterate on <stage>: <delta>`, `abort`.
- Document that planning artifacts now live in `.monolith/scratchpad/` (not `<runRoot>/docs/`), and that on `accept` they move to `.monolith/archive/<runId>/`.
- Add a "what to do at G2" subsection: "open any file in `.monolith/scratchpad/` and edit directly, then reply `continue`. The orchestrator detects edits via `scratchpad-lifecycle.ts detect-edits` and re-runs only dirty phases."
- Mention the `patchManifest` mechanism only if user-facing — likely skip; just say "the orchestrator routes self-healing intelligently based on what changed."

### 1.2 `src/monolith/TUTORIAL.md` — REWRITE
Current state: pipeline diagram on lines 20–24 is the v1 13-agent flow, missing market-researcher, ux-strategist, ds-extension-judge, design-principal, aesthetic-director, ux-writer, theming-resolver, production-readiness-auditor, runtime-inspector, commercial-auditor, self-healer.
Required updates:
- Replace the §0.2 lifecycle diagram with the v3 pipeline from `SKILL.md` (already correct there).
- Update §0.5 gate-response table: G2 and G3 are now turn-yielding with scratchpad/archive semantics. Replace the "what the gate wants" rows accordingly.
- Update output paths in every Case (A–G): `<runRoot>/docs/...` → `.monolith/scratchpad/*.md` during the run, archived to `.monolith/archive/<runId>/` on accept; the running app sits at `<workspaceRoot>/<appName>/`.
- Update "Cache" reference: `.cache/guidelines/<domain>/` → `.monolith/cache/guidelines/<hash>/` (or wherever `state-manager.ts` actually puts it — verify against the script).
- Section 4.6 says resume is "M4+ functionality — until then re-run from the last approval gate." Replace with the actual resume behavior: `state.json` + scratchpad allows resumption; document `--resume <runId>` if implemented, otherwise remove the section.
- Drop or update §3 "Reading the output" to reference the actual final layout (DELIVERY.md at workspace root + archived planning docs under `.monolith/archive/`).

### 1.3 `src/monolith/QUICKSTART.md` — REWRITE
Current state: §4 still lists 5 sequential planning agents; misses market-researcher, ux-strategist, ds-extension-judge, design-principal, aesthetic-director, ux-writer, theming-resolver. §6 lists only dev-qa + design-qa, missing production-readiness, runtime-inspector, commercial-auditor.
Required updates:
- Rewrite §4 (Planning) to reflect the parallel + batch + critique structure from `orchestrator.md`.
- Rewrite §6 (Code generation + QA) to reference the **unified QA loop** (5 gates run in parallel on iteration 1, delta on 2+) and the `run-qa.ts` driver script.
- Update §7 G3 response options to match the new turn-yield (`accept` / `iterate on <stage>: <delta>` / `abort`; remove the obsolete `log` option unless still wired).
- Update artifact paths (same as TUTORIAL.md).

### 1.4 `src/monolith/plan.md` — MAJOR REWRITE
Current state: this is the canonical "spec + tracker" but it's frozen at v3.0 with milestones M0–M5. It still says "13 agents," "scripts are stubs," lists the old folder layout missing `.monolith/`, scratchpad, archive, cache, and references `<workspaceRoot>/WORKFLOW-EVOLUTION-TRACKER.md` which doesn't exist in this repo.
Required updates:
- Add a v3.3 changelog entry at the top (zero-dep state tree, parallel planning, unified QA, fingerprint caching, scratchpad turn-yielding, batch DS extension judge, parallel design critique, inline competitive synthesis, persistent dev server, lazy Playwright via `resolve-browser.ts`, structured tally).
- Replace §1 folder layout to match what's actually in `src/monolith/` (`.monolith/` dir, `scratchpad/`, `archive/`, `cache/`, `patterns/log.jsonl`, the 23 implemented scripts, no `.cache/` legacy, etc.).
- Replace §2 stage diagram with the v3 pipeline (already correct in SKILL.md and orchestrator.md — copy from there).
- Replace §3 "13 agents" table with the full 24-agent table including market-researcher, ux-strategist, ds-extension-judge, design-principal, aesthetic-director, ux-writer, theming-resolver, production-readiness-auditor, runtime-inspector, commercial-auditor, self-healer. Drop competitive-synthesizer (see §3.1 below).
- Replace §10 tracker checkboxes — most §10.5 scripts are no longer stubs; mark them implemented. Also add the new scripts: `state-manager.ts`, `scratchpad-lifecycle.ts`, `render-planning-review.ts`, `run-phase.ts`, `run-qa.ts`, `get-affected-gates.ts`, `resolve-browser.ts`, `stop-dev-server.ts`.
- Replace §11 build order — the M0–M4 framing is obsolete. Either delete §11 or restate as "v3.3 status" describing what's done vs left.
- Drop §13.1 "Shippability snapshot" or replace with the current shippability state.
- Drop §14 references that point outside the repo (`../WORKFLOW_MASTER_PLAN.md`, `../phase-1-build-with-ds/`, `../shared/`, `../phase-2-rewire-to-ds/`) — these don't exist in the shared distribution.

### 1.5 `src/monolith/README.md` (maintainer) — UPDATE
Current state: still says "13 subagent prompts," shows the old pipeline arrow diagram missing 11+ agents, references `out/<run>/`, says "M1–M4 work" is needed for scripts.
Required updates:
- Update the agent count and the pipeline diagram (copy from SKILL.md).
- Drop the "Known rough edges (v1)" section or update to current rough edges (e.g., MCP browser tools optional, harness search varies by editor).
- Update output path mentions (`out/` → `<workspaceRoot>/<appName>/`).

### 1.6 Root `README.md` — UPDATE
Current state: §"Output Layout" shows `.monolith-runs/<runId>/docs/...` which contradicts the actual zero-dep layout (`.monolith/scratchpad/` + `.monolith/archive/<runId>/`). The agent table includes `competitive-synthesizer` which has been inlined.
Required updates:
- Fix the output layout block to match the actual structure.
- Remove `competitive-synthesizer` row from the org-role table (synthesis is now part of `market-researcher` per Solution 18).
- Add a one-paragraph note about turn-based G2/G3 (no background work) so users don't expect async.
- Verify the "Quick Start" invocation example is still the canonical syntax (consider replacing with the cleaner `/monolith build <brief>` form from `CLAUDE.md` if that is the canonical command).

### 1.7 Root `CLAUDE.md` and `AGENTS.md` and `.cursorrules` — VERIFY
These trigger files claim `/monolith build <brief>` is the entry point. Confirm SKILL.md frontmatter and the orchestrator agree, and that all five editor-specific copies (`.claude/`, `.cursor/`, `.opencode/`, `.trae/`, `.gemini/`) get re-synced after the doc rewrites above. Action: after every doc change in `src/monolith/`, run `node sync-skills.js` and commit the regenerated editor folders.

---

## 2. Lingering v3.0 artifacts that contradict v3.3

### 2.1 `src/monolith/agents/competitive-synthesizer.md` — DELETE
Per Solution 18 / T7-3, synthesis was inlined into `market-researcher.md` as a mandatory "Synthesis" appendix. The agent file is still present and is referenced by the root README and likely by leftover language in other agents. Action:
- Delete `src/monolith/agents/competitive-synthesizer.md`.
- Grep for any `competitive-synthesizer` references and remove (`SKILL.md` line ~68 still says "market-researcher (includes competitive synthesis)" — fine; root README mentions the agent — needs removal).
- Verify `market-researcher.md` actually emits the synthesis appendix; if not, port the relevant bullets from the deleted file before removing it.

### 2.2 `rules/checkpoint-discipline.md` — REWRITE around state tree
Other files (`rules/phase-manifest-discipline.md`, `plan.md`, `rules/deliverable-tally.md`) still mention `checkpoints/` directories. The new source of truth is `.monolith/state.json` per Rule 23 (the SKILL.md description). Action:
- Replace any "write `<runRoot>/checkpoints/<NN>-<phase>.json`" guidance with "call `stateManager.setPhaseStatus(...)` and `stateManager.setArtifact(...)`."
- Update `rules/deliverable-tally.md` so the tally is computed from `state.artifacts` by the orchestrator (per Solution 19) instead of being printed by every agent.
- Update `rules/phase-manifest-discipline.md` so `reads:` / `writes:` reference state-tree branches (e.g., `state.phases.dsIndexer`, `state.artifacts.designDecisions`) and scratchpad files, not the old `checkpoints/` dir.

### 2.3 Agent frontmatter `reads:` / `writes:` — AUDIT EACH AGENT
The zero-dep plan (T0-3, T2-1) requires every agent's frontmatter to use the new state-tree paths. Action: open every file in `src/monolith/agents/` and confirm:
- `reads:` lists state-tree branches via `state.*` paths and/or `.monolith/scratchpad/<file>.md` paths.
- `writes:` declares state-tree branches it expects the orchestrator to update.
- `developer.md` mandates a `<patchManifest>` block (per Solution 3 / T2-2 / T3-5) — verify it is actually there.
Anything still pointing at `<runRoot>/checkpoints/*.json` or `<runRoot>/docs/*.md` is stale.

---

## 3. Missing / under-specified pieces from the plans

### 3.1 `package.json` is missing scripts the plan referenced
`src/monolith/package.json` does not include npm scripts for the newer scripts in `scripts/`. Add (or remove from the plan as deliberate omission):
- `"state": "tsx scripts/state-manager.ts"` (CLI surface for debug)
- `"run-phase": "tsx scripts/run-phase.ts"`
- `"run-qa": "tsx scripts/run-qa.ts"`
- `"scratchpad": "tsx scripts/scratchpad-lifecycle.ts"`
- `"affected-gates": "tsx scripts/get-affected-gates.ts"`
- `"resolve-browser": "tsx scripts/resolve-browser.ts"`
- `"render-planning-review": "tsx scripts/render-planning-review.ts"`
- `"triage": "tsx scripts/triage-input.ts"`
- `"parse-guidelines-repo": "tsx scripts/parse-guidelines-repo.ts"`
- `"fetch-guidelines-web": "tsx scripts/fetch-guidelines-web.ts"`
- `"generate-guidelines-fallback": "tsx scripts/generate-guidelines-fallback.ts"`
- `"extract-tokens": "tsx scripts/extract-tokens.ts"`
- `"extract-icons": "tsx scripts/extract-icons.ts"`
- `"install-deps": "tsx scripts/install-deps.ts"`

### 3.2 No `.gitignore` at the **repo root**
Only `src/monolith/.gitignore` exists. The repo-root `.gitignore` from the plan is missing. Add at `C:\Users\mintb\Desktop\Dev\monolith-skill\.gitignore`:
```
node_modules/
dist/
.monolith/scratchpad/
.monolith/cache/
.monolith-cache/
.monolith-runs/
.monolith-memory/
*.log
.DS_Store
```
(Confirm `.monolith/state.json` and `.monolith/archive/` are kept under version control if the user wants run history; the plan implies scratchpad and cache are gitignored but state and archives may not be.)

### 3.3 `state.schema.json` not present
Plan T0-4 calls for a zod-backed schema at `.monolith/state.schema.json`. The schema is referenced inside `state-manager.ts`, but the standalone JSON-schema file (so external tools and the harness can validate state without running TS) is missing from `src/monolith/`. Either:
- Generate the JSON schema from the zod schema in `state-manager.ts` and write it to `.monolith/state.schema.json` (and add a script to regenerate), or
- Drop the requirement and document that `state-manager.ts` is the only validator.

### 3.4 `--resume <runId>` is documented but unverified
Both TUTORIAL §4.6 and orchestrator's "Fail modes" table imply resume works. Action: verify `state-manager.ts` exposes a resume entry-point, and that `orchestrator.md` documents the exact command users should send. If not implemented, either implement it (since `state.json` + fingerprints make it cheap) or remove the claim from docs.

### 3.5 `--lazy` mode behavior at G2/G3
Old docs say `--lazy` skips G1/G2; G3 stays interactive. New zero-dep plan made G2 turn-yielding with scratchpad. Action: define exactly what `--lazy` does now (auto-`continue` at G2 unless edits detected? auto-`accept` at G3?) and update both `rules/approval-gate-rules.md` and the SKILL.md mode-flag description.

### 3.6 Cache-control flags
Solution 4 / T5 promises `--no-cache`, `--refresh-research`, `--refresh-*`. Action: confirm these flags are wired into `run-phase.ts` and document them somewhere user-visible (SKILL.md mode flags or a new "Advanced flags" section).

### 3.7 MCP browser config (Solution 8 / T4-3)
`.cursor/mcp.json` or `.claude/mcp.json` was specified to enable the MCP browser fallback for `runtime-inspector.md`. Neither file is in the repo. Action: either add a documented opt-in MCP config sample under `references/mcp-browser.json.sample` with instructions in SKILL.md, or drop the MCP-browser path from `runtime-inspector.md` so users don't expect it.

### 3.8 Harness-native search wiring (Solution 8 / T4-1)
The plan said agents would use a `search:` field in their `reads:` for harness-native lookups. Confirm `phase-manifest-discipline.md` actually defines this field and at least the high-context agents (`developer.md`, `lead-designer.md`, `engineering-manager.md`, `design-qa.md`) use it. If not present, this is the highest-leverage missing optimization for token reduction.

### 3.9 Stage fingerprinting per phase
`run-phase.ts` exists and the orchestrator calls it for `dsIndexer / guidelinesResolver / marketResearcher / themingResolver / researcher`. Action: verify each phase actually has a fingerprint function (T5-2 listed five phases) and that the cache-hit path copies outputs from `.monolith/cache/` to scratchpad correctly. Add a quick smoke test under `examples/` that runs the same brief twice and confirms the second run hits all five caches.

### 3.10 `--full / --planOnly / --themeOnly / --UXR / --noPRD` are documented but may not be wired
Audit `orchestrator.md` to confirm each flag has explicit branch logic. If a flag is missing, either implement it or remove from SKILL.md and tutorials. (`--themeOnly` and `--UXR` in particular are common asks.)

### 3.11 Auto-approve G3 with opt-out window (T8-2)
The original plan had a 5-minute auto-approve window. The zero-dep plan replaced it with explicit turn-yield. Make sure no doc still references "auto-approve after 5 minutes" — `rules/approval-gate-rules.md` is the most likely culprit.

---

## 4. Tooling / runnability gaps

### 4.1 No example end-to-end trace
`src/monolith/examples/` is empty. The plan called for at least one replayable trace. For a "production ready, sharable" skill, ship one minimal example:
- A trivial brief, a tiny test DS adapter under `examples/<run>/ds/`, and the resulting `state.json` + scratchpad + DELIVERY.md.
- This doubles as a smoke test (T11-4 from the original plan).

### 4.2 No DS adapter ships in-repo
`TUTORIAL.md` and `plan.md` both reference `../shared/ds-adapters/<name>.json`. That path is outside the repo. Without at least one adapter, a fresh user has nothing to point `--ds-repo` at. Action: ship `examples/ds-adapters/<name>.json` for one popular DS (shadcn or Ant Design) as a working starting point, and update the tutorials to reference the in-repo path.

### 4.3 No CI / smoke-test script
`sync-skills.js` exists but there is no `npm test` or sanity check. Add at least:
- `npm run typecheck` → `tsc --noEmit`
- `npm run sync` → `node sync-skills.js`
- `npm run lint` → optional, but improves trust for redistribution.

### 4.4 `node_modules/` is committed under `src/monolith/`
The directory listing showed `src/monolith/node_modules/`. If this is committed, the repo bloats badly. Verify, and if committed, add to `.gitignore` and `git rm -r --cached`. (Do not run destructive git ops without user approval — surface as an action item.)

### 4.5 Synced editor folders
`.claude/`, `.cursor/`, `.opencode/`, `.trae/`, `.gemini/` exist and are populated. Confirm `sync-skills.js` runs after every doc change above so the editor copies don't drift. Consider adding a pre-commit hook (or at minimum a CI check) that fails if `src/monolith/` differs from any editor folder.

---

## 5. Optional hardening before sharing

These aren't strictly missing but improve the "ready for others to use directly" bar.

- **Setup script.** Add `scripts/setup.ts` that runs `npm install`, calls `resolve-browser.ts` to print which browser will be used, and creates the `.monolith/` skeleton. Lets new users one-command bootstrap.
- **Versioned changelog.** A top-level `CHANGELOG.md` summarizing the v3.0 → v3.3 changes for users who've used the skill before.
- **Troubleshooting playbook.** `TROUBLESHOOTING.md` covering the top 10 failures (Playwright not found, MCP unreachable, dev server port conflict, scratchpad edits not detected, fingerprint cache miss when expected hit, etc.) with concrete recovery commands.
- **License + contribution bar.** Root `README.md` says MIT but no `LICENSE` file is present at the repo root. Add one.
- **Agent file naming consistency.** Some agents are named for roles (`product-manager.md`), others for verbs (`self-healer.md`). Not blocking, but a once-over rename or aliases doc would help newcomers.

---

## 6. Suggested execution order

1. Delete `competitive-synthesizer.md`, sweep references (§2.1).
2. Update agent frontmatters and `rules/checkpoint-discipline.md` to the state-tree contract (§2.2 + §2.3).
3. Rewrite the five outdated user docs in this order (because they cascade): `SKILL.md` (already mostly correct; spot-check) → `plan.md` → `TUTORIAL.md` → `QUICKSTART.md` → `user_tutorial.md` → root `README.md` → maintainer `README.md` (§1.1–§1.6).
4. Add `.gitignore` at root, add the missing npm scripts, verify `node_modules` not committed (§3.1, §3.2, §4.4).
5. Wire / document mode flags and resume (§3.4, §3.5, §3.6, §3.10).
6. Verify fingerprint phases, harness-native search, MCP-browser config (§3.7, §3.8, §3.9).
7. Ship example trace + at least one DS adapter (§4.1, §4.2).
8. Add `npm run typecheck` and `npm run sync` and basic smoke (§4.3).
9. Run `node sync-skills.js`, commit, run `tsc --noEmit`, then run a real end-to-end smoke against the example (§4.5).
10. Add LICENSE, CHANGELOG, TROUBLESHOOTING (§5).

After step 10 the skill is genuinely ready to hand to a stranger and have them run `/monolith build <brief>` end-to-end without prior context.
