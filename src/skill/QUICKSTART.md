# QUICKSTART

A 5-minute happy-path walkthrough. Uses placeholders — drop in your own DS and brief.

---

## 0. Prerequisites

- Node ≥ 20, npm ≥ 10.
- An AI editor that discovers this skill: Claude Code, Cursor, OpenCode, Trae, or a Gemini-class editor (auto-synced via `node sync-skills.js`).
- **DS source** — one of:
  - An MCP that exposes your DS's component/token/icon catalog, OR
  - A local DS repo with an adapter at `examples/ds-adapters/<your-ds>.json` (one ships with this repo as a starting point), OR
  - Both.
- **Guidelines source** — any of: attached `.md` files, a website URL, inline docs in the DS repo, or nothing (the fallback generator runs).
- `tsx` is bundled via `package.json`; `npm install` once at the skill root.

---

## 1. Invoke the skill

In your editor's chat, type:

```
/monolith build <your product brief>.
  - DS: {mcp:<mcp-name> | repo:<path> | both:mcp:<n>,repo:<p>}
  - Guidelines: {files:<csv-paths> | url:<link> | repo-inline | auto}
  - Theme: {light | dark | both}
  - Density: {compact | comfortable | spacious}
  - Locale: <BCP-47>
  - ProductType: {consumer-saas | b2b-saas | internal-tool | regulated-tool | developer-tool}
```

Anything you omit is asked at G1.

---

## 2. Gate 1 — review the input manifest (blocking)

The orchestrator runs `triage` and pauses. You see:

```json
{
  "runId": "<YYYY-MM-DD>_<kebab-brief>",
  "brief": "<your brief>",
  "ds": { "source": "...", "name": "...", "version": "..." },
  "guidelines": { "source": "..." },
  "promptType": "...",
  "constraints": { "theme": "light", "density": "comfortable", "locale": "en-US" },
  "unresolved": []
}
```

Respond `ok` (or `change <field> to <value>`).

---

## 3. Discovery — Track A (parallel)

Three scripts/agents run in parallel:

- **ds-indexer** → `<runRoot>/ds-knowledge/{component-index, tokens, icons}.json`
- **guidelines-resolver** → `<runRoot>/guidelines/{brand, voice, ux-principles, accessibility, content, motion, layout}.md`
- **market-researcher** → `.monolith/scratchpad/market-research.md` (with inlined `## Synthesis` appendix)

Then sequentially:

- **theming-resolver** → `<runRoot>/theme-spec.json` + `<runRoot>/themeability-report.md`
- **researcher** → `.monolith/scratchpad/research.md`

Cacheable phases (`dsIndexer`, `guidelinesResolver`, `marketResearcher`, `themingResolver`, `researcher`) are fingerprinted — re-runs against unchanged inputs hit cache and skip the work.

No user input needed unless a script blocks.

---

## 4. Planning — Tracks B & C (parallel + batch + critique)

- **Track B (parallel):** `product-manager` ‖ `ux-strategist` → `.monolith/scratchpad/prd.md` + `differentiation-map.md`.
- **Track B continued (parallel):** `ux-architect` ‖ `lead-designer` (early draft) → `information_architecture.md` + `user_flow.md` + initial `design_decisions.md`.
- **Track C batch:** `ds-extension-judge` rules on ALL extension requests in one pass → `ds-extensions/<slug>.md` per request.
- **Track C parallel critique:** `design-principal` ‖ `aesthetic-director` → `design-principal-critique.md` + `aesthetic-audit.md`.
- **Track C sequential:** `ux-writer` → `ux-writing-pass.md`.
- **Track C sequential:** `engineering-manager` → `build_specs.md`.

---

## 5. Gate 2 — review the plan (turn-yielding)

The orchestrator generates `.monolith/scratchpad/PLANNING_REVIEW.md`, prints the yield message, and **stops**. You can:

- Open any file in `.monolith/scratchpad/` and edit directly.
- Reply on your next turn:
  - `continue` → orchestrator runs `scratchpad-lifecycle.ts detect-edits`, re-runs any dirty phases, then proceeds.
  - `iterate on prd: <delta>` → re-run product-manager + downstream.
  - `restart from <phase>` → reset phases from there.
  - `abort` → stop.

---

## 6. Code generation + unified QA

- `pattern-decider` → `pattern_decisions.md` and any new `.monolith-memory/patterns/<slug>.md`.
- `developer` (full-gen) scaffolds `<workspaceRoot>/<appName>/` (Vite + your DS + router + theme + fixtures + every screen) and emits a `<patchManifest>` block.
- `start-dev-server.ts` boots Vite via the programmatic API; the server stays running across QA iterations.
- **Unified QA loop** (Solution 3):
  - Iteration 1: all five gates run **in parallel** — `dev-qa`, `production-readiness-auditor`, `runtime-inspector`, `design-qa`, `commercial-auditor`. Issues aggregate into `state.issues.open[]`.
  - Self-healer merges issues into ONE patch brief; developer applies one patch with a new `<patchManifest>`.
  - Iteration 2+: `get-affected-gates.ts` reads the patchManifest and runs only the gates the patch could have affected. Conservative fallback to full sweep on ambiguity. Max 5 iterations per gate.

---

## 7. Gate 3 — accept the delivery (turn-yielding)

```
[G3 — Delivery]
App running at http://localhost:<port>
Run command: cd <appName> && npm run dev
Self-healing summary: ...
```

Reply `accept` to:
- Archive `.monolith/scratchpad/` → `.monolith/archive/<runId>/`.
- Clear scratchpad.
- Mark `state.meta.status = "completed"`.
- Print Phase 2 handoff.

Or `iterate on <stage>: <delta>` to fix something. Or `abort` to keep everything as-is.

---

## 8. Next step (Phase 2)

Once `accept`:

```
/rewire-to-ds <figma-frame-url>
  --plan <appRoot>/docs/screen-plan.json
  --tokens <runRoot>/ds-knowledge/tokens.json
  --index  <runRoot>/ds-knowledge/component-index.json
```

(Phase 1.5 — the html.to.design step into Figma — is manual.)

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Triage asks for DS when one was provided | Check the adapter path resolves; check the MCP name matches a reachable server. |
| Repo-indexer crashes on ts-morph | Ensure the adapter's `propTypes.tsconfig` points at a real file. |
| MCP returns no components | Confirm the MCP exposes the catalog method your adapter expects; if unreliable, switch to `repo` or `both`. |
| Guidelines fallback has many "insufficient evidence" sections | Provide at least a `README.md` or a website URL. Quality tracks input density. |
| Dev server won't boot | Check `<runRoot>/qa/dev_qa_report.md § BUILD / SERVER gates`. |
| DS_FIRST violation | Read the report — every violation lists file + line + the DS replacement. |
| Cache miss when expected hit | `state.phases.<name>.fingerprint` changed; check inputs. Force refresh via `--no-cache` or delete `.monolith/cache/<tier>/`. |
| Playwright won't install | `scripts/resolve-browser.ts` should fall back to system Chrome/Edge. Set `PLAYWRIGHT_CHROMIUM_PATH` to override. |

See `TROUBLESHOOTING.md` (repo root) for the full playbook.
