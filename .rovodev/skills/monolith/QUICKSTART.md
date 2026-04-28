# QUICKSTART

A 5-minute happy-path walkthrough. Uses placeholders — drop in your own DS and brief.

---

## 0. Prerequisites

Pick ONE combination of DS source + guidelines source from the eight input shapes in [plan.md §0.4](plan.md):

- Node ≥ 20, npm ≥ 10.
- **DS source** — either:
  - An MCP that exposes your DS's component/token/icon catalog, OR
  - A local DS repo with an adapter at `../shared/ds-adapters/<your-ds>.json`, OR
  - Both.
- **Guidelines source** — any of: attached `.md` files, a website URL, inline docs in the DS repo, or nothing (the fallback generator runs).
- `tsx` or `ts-node` on your PATH.

---

## 1. Invoke the skill

From Claude Code, in this folder:

```
/monolith build <your product brief>.
  - DS: {mcp:<mcp-name> | repo:<path> | both}
  - Guidelines: {files:<csv-paths> | url:<link> | repo-inline | auto}
  - Theme: {light | dark | both}
  - Density: {compact | comfortable | spacious}
  - Locale: <locale>
```

Anything you omit is asked at G1.

---

## 2. Gate 1 — review the input manifest

The orchestrator runs `agents/triage.md` and pauses. You see something like:

```json
{
  "runId": "<YYYY-MM-DD>_<kebab-brief>",
  "brief": "<your brief>",
  "ds": {
    "source": "<mcp|repo|both>",
    "name": "<your-ds>",
    "version": "<semver|commit>",
    "mcp": { "name": "<mcp-name>", "reachable": true } | null,
    "repo": { "path": "<path>", "adapterPath": "<path>" } | null
  },
  "guidelines": { "source": "<provided|website|repo-inline|generated>" },
  "promptType": "<single-screen|multi-screen-app>",
  "constraints": { "theme": "light", "density": "comfortable",
                   "breakpoints": ["sm","md","lg"], "locale": "en-US" },
  "unresolved": []
}
```

Respond `ok` to proceed.

---

## 3. Indexing + guidelines (automatic)

- `scripts/index-ds-repo.ts` or `scripts/index-ds-mcp.ts` (depending on source) builds `<runRoot>/ds-knowledge/component-index.json`.
- `scripts/extract-tokens.ts` + `scripts/extract-icons.ts` build `tokens.json` + `icons.json`.
- Guidelines resolution runs the right pipeline for the detected source — see [rules/guidelines-inference-rules.md](rules/guidelines-inference-rules.md).

No user input needed here unless a script fails — in which case the run blocks with a concrete error.

---

## 4. Planning (Stages 3–7)

The orchestrator runs these agents in sequence, each emitting one or two markdown files:

- `agents/researcher.md` → `docs/research.md`
- `agents/product-manager.md` → `docs/prd.md`
- `agents/ux-architect.md` → `docs/information_architecture.md` + `docs/user_flow.md`
- `agents/lead-designer.md` → `docs/design_decisions.md` + `docs/best_practices.md`
- `agents/engineering-manager.md` → `docs/build_specs.md`

---

## 5. Gate 2 — review the plan

You see a one-page summary pulling highlights from each doc and links to the full files. Respond:

- `ok` → continue to code
- `iterate on prd: <delta>` → re-run just PM with the delta
- `restart from design` → re-run lead-designer + EM
- `abort` → stop

---

## 6. Code generation + QA

- `agents/pattern-decider.md` → `docs/pattern_decisions.md` + any new `patterns/*.md`
- `agents/developer.md` → `<runRoot>/app/**` (scaffolded Vite app with your DS, router, theme, fixtures, every screen)
- `agents/dev-qa.md` → `qa/dev_qa_report.md` (tsc, eslint, build, dev-server boot, axe, DS_FIRST)
- `agents/design-qa.md` → `qa/design_qa_report.md` + promotes any new patterns

---

## 7. Gate 3 — accept the delivery

You see:

```
✓ Prototype ready at http://localhost:<port>
  run: cd <runRoot>/app && npm run dev
```

plus the full artifact map. Respond `accept` to close the run.

---

## 8. Next step (Phase 2)

Once accepted, hand off to Phase 2:

```
/rewire-to-ds <frame-url>
  --plan <runRoot>/docs/screen-plan.json
```

(Phase 1.5 — the html.to.design import into Figma — is manual in v1.)

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Triage asks for DS when one was provided | Check the adapter path is absolute or resolvable from the skill root; check the MCP name matches a reachable server. |
| Repo-indexer crashes on ts-morph | Ensure the adapter's `propTypes.tsconfig` points at a real file. |
| MCP returns no components | Confirm the MCP exposes the catalog method your adapter expects; if mcp is unreliable, switch to `repo` or `both`. |
| Guidelines fallback has too many "insufficient evidence" sections | Provide at least a `README.md` or a website URL; fallback quality tracks input density. |
| Dev-server won't boot | Check `qa/dev_qa_report.md` — the specific gate failure is named there. |
| DS_FIRST violations | Read the report. Every violation lists the file + line + the DS replacement expected. |
