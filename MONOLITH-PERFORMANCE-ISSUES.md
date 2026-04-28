# Monolith Skill — Performance Analysis & Bottleneck Report

> **Date:** 2026-04-28  
> **Skill Version:** v3.2  
> **Scope:** Why the `/monolith build` workflow takes an extremely long time to run, and the root causes behind each bottleneck.

---

## Executive Summary

The Monolith skill is architected as a **25+ agent, strictly-sequential, zero-skip pipeline** with **5 self-healing QA loops** (each up to 5 iterations), **3 human approval gates**, **multiple design revision rounds**, and **heavy headless-browser runtime verification**. This produces market-grade output, but the combinatorial cost is severe: a single run can invoke 40–80+ agent calls, write 30+ files to disk, boot a dev server 5–25 times, and run Playwright across every route at 4 viewports.

**Estimated minimum agent invocations per full run:**  
- Best case (1 iteration per QA loop, 0 design revisions): ~22 agent invocations  
- Realistic case (2–3 QA iterations, 1 design revision round): ~35–45 invocations  
- Worst case (5 iterations per QA loop, 2 design revision rounds): ~70–90 invocations  

Each agent is a **Sonnet/Opus model call** with large context windows (planning docs, DS indexes, guidelines, code). The result is multi-hour runtimes even when everything goes well.

---

## 1. Architectural Pipeline Issues

### 1.1 Excessive Agent Count with Minimal Parallelization

The pipeline specifies **25+ distinct agents** (orchestrator, triage, ds-indexer, guidelines-resolver, theming-resolver, market-researcher, competitive-synthesizer, researcher, product-manager, ux-strategist, ux-architect, lead-designer, ds-extension-judge, design-principal, aesthetic-director, ux-writer, engineering-manager, pattern-decider, developer, dev-qa, production-readiness-auditor, runtime-inspector, design-qa, commercial-auditor, self-healer).

**Only one stage is parallel:** Stage 3 (`ds-indexer ‖ guidelines-resolver ‖ market-researcher`).  
**Everything else is strictly sequential.**

**Impact:** Stages 4–12 (planning) are 9 sequential Sonnet calls. Stages 16–20 (QA loops) are 5 sequential Sonnet calls, each potentially repeating. Even at 30–60 seconds per agent invocation, the planning layer alone is 5–10 minutes of pure latency with zero opportunity for parallel work.

### 1.2 No Stage Skipping Allowed

Per `plan.md` §2:
> "A run is exactly these stages, in order. **No stage is skippable.** Stages that don't apply to a given input shape still execute and emit a 'not applicable, here is why' marker."

**Impact:** Even if the user provides perfect guidelines, the `guidelines-resolver` still runs. Even if the DS is already indexed in cache, the `ds-indexer` agent is still invoked (it just reuses cache). Every artifact is generated even when the user doesn't need it.

### 1.3 Model Tier Mismatch — Sonnet Used Where Haiku Would Suffice

Per `plan.md` §3 and agent specs:
- `orchestrator` → **Opus** (just routing and gates)
- `ds-indexer` → **Sonnet** (mostly script invocation)
- `guidelines-resolver` → **Sonnet** (mostly parsing)
- `researcher` → **Sonnet** (research synthesis)
- `product-manager` → **Sonnet**
- `ux-strategist` → **Sonnet**
- `ux-architect` → **Sonnet**
- `lead-designer` → **Sonnet**
- `design-principal` → **Sonnet**
- `aesthetic-director` → **Sonnet**
- `ux-writer` → **Sonnet**
- `engineering-manager` → **Sonnet**
- `pattern-decider` → **Sonnet**
- `developer` → **Sonnet** (heavy — writes all code)
- `dev-qa` → **Haiku** (the one cheap agent)
- `design-qa` → **Sonnet**
- `commercial-auditor` → **Sonnet**
- `self-healer` → **Sonnet**

**Impact:** Of ~20 substantive agents, only `dev-qa` uses Haiku. `triage` also uses Haiku, but the heavy lifting (indexing, planning, design, code, QA) all runs on Sonnet. Many of these tasks (script invocation, checkpoint writing, report formatting) are deterministic enough for Haiku or could be consolidated.

---

## 2. QA & Self-Healing Loop Inefficiencies

### 2.1 Five Sequential QA Loops × Up to 5 Iterations Each

Per `rules/self-healing-loop.md`:
- **dev-qa** → max 5 iterations
- **production-readiness-auditor** → max 5 iterations
- **runtime-inspector** → max 5 iterations
- **design-qa** → max 5 iterations
- **commercial-auditor** → max 5 iterations

**Worst-case math:** 5 gates × 5 iterations = 25 QA passes + 25 self-healer calls + 25 developer patch calls = **75 agent invocations** in QA alone.

**Realistic math (2 iterations per gate):** 5 × 2 = 10 QA passes + 10 self-healer + 10 developer patches = **30 agent invocations**.

**Impact:** QA is the single largest contributor to runtime. Each iteration involves:
1. QA agent runs static/runtime checks (some involving `npm run build`, dev server boot, Playwright)
2. Self-healer reads issues, groups, deduplicates, writes brief
3. Developer reads brief, applies patches, runs `npm run build`
4. Orchestrator verifies checkpoint, re-invokes QA

### 2.2 Each QA Loop Re-Boots the Dev Server and Re-Runs Build

Per `agents/developer.md` §Patch Mode:
> "Verify before returning. Run `npm run build`."

Per `agents/dev-qa.md`:
> **BUILD** gate: `npm run build` exits 0  
> **SERVER** gate: `npm run dev` serves 200 on `/` within 60s

Per `agents/runtime-inspector.md`:
> Boot dev server, wait for readiness (retry up to 30s), then sweep every route.

**Impact:** Every patch cycle = at least one `npm run build` + one dev server boot. In a realistic run with 10 patch cycles, that's **10 full builds + 10 server boots**. Build times for Vite + TS + DS can easily be 10–30 seconds each. Server boot + healthcheck is another 10–30 seconds. That's **3–10 minutes of pure tooling latency** per run, independent of AI speed.

### 2.3 Runtime Inspector Does an Exhaustive Browser Sweep

Per `rules/runtime-verification-rules.md` and `agents/runtime-inspector.md`:
- **Phase A:** Visit every route, 4 viewports each, screenshot + console check
- **Phase B:** Nav invariant check after every navigation
- **Phase C:** Click EVERY interactive element on EVERY route (buttons, links, inputs, selects, tabs, switches, etc.)
- **Phase D:** Scroll to bottom, open all collapsibles, re-measure scroll height
- **Phase E:** For every modal: open → focus trap test (10 tabs) → Escape → close button → backdrop
- **Phase F:** For every form: empty submit → assert validation → fill → submit → assert success
- **Phase G:** Responsive sweep at 4 viewports

**Impact:** For a 10-route app with 8 interactive elements per route, this is:
- 10 routes × 4 viewports = 40 screenshots
- 10 routes × 8 interactables = 80 click/type assertions
- 10 routes × scroll + collapsible expansion = 20+ scroll ops
- ~5 modals × 5 lifecycle checks = 25 modal ops
- ~3 forms × 3 lifecycle checks = 9 form ops
- Playwright overhead per operation: ~1–3 seconds

**Total runtime-inspector time: easily 3–8 minutes per pass** — and it runs up to 5 times per gate, and it runs AFTER dev-qa, so the app must be fully built and server-booted first.

### 2.4 Commercial Auditor Cannot Run in Parallel with Other QA Loops

Per `agents/orchestrator.md` §Parallelization Policy:
> "Stages 16–20 (QA loops): strictly sequential — later loops may depend on earlier fixes. Commercial-auditor runs LAST because it depends on the app being design-complete."

**Impact:** Even if design-qa and commercial-auditor check different things, they are forced sequential. A 5-minute commercial audit cannot start until design-qa converges, even if the developer could patch both sets of issues in one pass.

---

## 3. Design Phase Iteration Bloat

### 3.1 lead-designer ↔ ds-extension-judge Interleaved Ruling

Per `agents/lead-designer.md`:
> "You work **interactively with ds-extension-judge**: every time you propose going beyond the DS, you emit a request and **wait for a ruling** before finalizing that section."

Per `agents/orchestrator.md` §Parallelization Policy:
> "Lead-designer ↔ ds-extension-judge: interleaved, not parallel."

**Impact:** If a design has 4 custom component proposals, that's 4 sequential round-trips:
1. lead-designer proposes extension A
2. ds-extension-judge rules on A
3. lead-designer proposes extension B
4. ds-extension-judge rules on B
...

Each round-trip is 2 Sonnet invocations. For a complex app with many extensions, this alone is 8–12 agent calls before the design is finalized.

### 3.2 design-principal → Up to 2 Revision Rounds with lead-designer

Per `agents/orchestrator.md`:
> "Design-principal ↔ lead-designer revisions: up to 2 rounds. Round 3 does NOT happen — disagreement is surfaced at G2."

**Impact:** 1–3 additional Sonnet calls (design-principal critique + lead-designer revision + design-principal re-review). If Round 2 still has issues, the disagreement is logged but not resolved — it becomes a G2 blocker.

### 3.3 aesthetic-director → Up to 2 Revision Rounds with lead-designer

Per `agents/aesthetic-director.md`:
> "Round 2 is the hard boundary. No Round 3. Escalate unresolved items to orchestrator → G2."

**Impact:** Another 1–3 Sonnet calls. The aesthetic audit is extremely thorough (25-tell checklist, per-screen table, color/typography/space/depth/motion/iconography audits, empty/error/loading audits). Just generating the audit document is heavy; doing it twice is worse.

### 3.4 ux-writer Pass Is a Full Rewrite of Every String

Per `agents/ux-writer.md` (implied by `SKILL.md` and `agents/developer.md`):
> "Every user-visible string in code matches `ux-writing-pass.md` exactly."

**Impact:** For a 10-screen app with 50 strings per screen, the ux-writer rewrites 500 strings. Then the developer must apply them. If a string is missed, it becomes a design-qa issue in the heal loop.

---

## 4. I/O and Checkpoint Overhead

### 4.1 21 Checkpoint Files Written and Re-Read Between Every Agent

Per `rules/checkpoint-discipline.md`:
> "Every run has 21 checkpoint files... Checkpoints are compact summaries (≤4KB each)... Every agent reads the checkpoint of the immediately preceding phase."

**Impact:** 21 JSON files are written during a run. Every agent reads at least one checkpoint + its declared `reads:` files + writes its own checkpoint. This is disk I/O + schema validation overhead that adds up across 25+ agents.

### 4.2 Full Artifacts Are Regenerated on Every Iteration

When a user says `iterate on prd: shorten` at G2, `agents/orchestrator.md` §Iteration Economics says:
> "Will re-run: product-manager. Downstream stages that will ALSO re-run: ux-architect, lead-designer, engineering-manager."

**Impact:** A single PRD change cascades through 4 planning agents, each re-reading all upstream docs, re-writing their own docs, and re-emitting checkpoints. A 2-minute PRD edit triggers 10–15 minutes of downstream re-planning.

### 4.3 Pattern Memory I/O on Every Run

Per `agents/pattern-decider.md` (implied) and `agents/design-qa.md`:
- `pattern-decider` reads `<memoryRoot>/patterns/INDEX.md`
- `design-qa` promotes new patterns → writes `<memoryRoot>/patterns/<slug>.md`
- `orchestrator` regenerates `<memoryRoot>/patterns/INDEX.md`

**Impact:** Cross-run file I/O that adds latency, especially as the pattern library grows.

---

## 5. Human-in-the-Loop Bottlenecks

### 5.1 Three Mandatory Approval Gates (G1, G2, G3)

Per `rules/approval-gate-rules.md`:
- **G1** — After triage. User must confirm input manifest.
- **G2** — After engineering-manager. User must confirm research + PRD + IA + design + build spec.
- **G3** — After all QA loops. User must confirm delivery.

**Impact:** The pipeline stops and waits for human text input **3 times minimum**. In an async chat interface, each gate could wait minutes to hours for the user to respond. If the user iterates at G2 (`iterate on prd: shorten`), the pipeline restarts and hits G2 again.

### 5.2 G2 Is Especially Heavy and Likely to Trigger Iterations

G2 shows:
- Brief + personas + gap inferences
- Differentiators + competitor-gap citations
- Per-screen grades from design-principal
- Aesthetic-audit verdict + AI-tells
- DS extensions approved/denied
- Disagreement log (principal vs lead-designer, aesthetic-director vs lead-designer, judge vs designer)
- PRD feature count, page count, route list, component counts, custom-component count, pending blockers

**Impact:** This is an enormous summary. Users are likely to find something to iterate on, which triggers downstream re-runs and another G2 wait.

---

## 6. Runtime Verification & Tooling Heaviness

### 6.1 Playwright Installation Per Run

Per `agents/developer.md` §Full-generation mode:
> "Install Playwright if runtime-inspector will run next: `npm install -D playwright @playwright/test && npx playwright install chromium`."

Per `agents/runtime-inspector.md`:
> "Ensure Playwright is installed... `npx playwright install chromium --with-deps`"

**Impact:** Playwright + Chromium browser download is **100–300MB** and can take **1–5 minutes** depending on network. It happens on every fresh run (unless cached in `node_modules`, but the app is scaffolded fresh per run).

### 6.2 Dev Server Boot Is Required for 3 Separate QA Agents

- `dev-qa` boots server for COVERAGE + SERVER + AXE gates
- `runtime-inspector` boots server for route sweep + interaction testing
- `design-qa` relies on runtime-inspector screenshots but may trigger re-runs

**Impact:** The server is booted, killed, and re-booted multiple times. Each boot requires Vite to warm up, which for a DS-heavy app is 5–15 seconds.

### 6.3 axe-run.ts Executed on Every Route

Per `agents/dev-qa.md`:
> **AXE** gate: Zero critical a11y violations on every route via `scripts/axe-run.ts`

**Impact:** For a 10-route app, axe must visit and analyze each route. Accessibility tree computation is CPU-intensive. This happens on every dev-qa iteration.

---

## 7. Documentation & Artifact Bloat

### 7.1 16+ Planning Artifacts, All Mandatory

Per `SKILL.md` §Output layout and `plan.md` §8:
- `market-research.md`
- `competitive-synthesis.md`
- `research.md`
- `prd.md`
- `differentiation-map.md`
- `information_architecture.md`
- `user_flow.md`
- `design_decisions.md`
- `best_practices.md`
- `design-principal-critique.md`
- `aesthetic-audit.md`
- `ds-extensions/*.md` (one per ruling)
- `ux-writing-pass.md`
- `build_specs.md`
- `pattern_decisions.md`
- `commercial-audit.md`
- `qa.md` (consolidated)
- `DELIVERY.md`

**Impact:** Every agent spends tokens generating extensive markdown. `design_decisions.md` alone requires a per-section component table, token applications, visual grammar declaration, state plans, density & breakpoints, a11y intent, extension requests, DS-first attempts log, and differentiator expression map. Even with the 10K token cap (Rule 25), these are large documents that consume model context and generation time.

### 7.2 7 Canonical Guideline Documents Generated Per Run

Per `plan.md` §6:
> "Whatever the source, we end up with these seven: brand.md, voice.md, ux-principles.md, accessibility.md, content.md, motion.md, layout.md"

**Impact:** Even if guidelines are provided, they are validated and normalized. If generated from fallback, a Sonnet prompt must synthesize all seven from the component index. This is 7 files of structured content generation.

### 7.3 Deliverable Tally Printed After Every Artifact

Per `rules/deliverable-tally.md` (Rule 26):
> "`📋 Delivered: X | Remaining: Y` printed after every artifact."

**Impact:** Minor, but every agent must compute and emit this tally, adding token overhead to every output.

---

## 8. Implementation Gaps (Scripts Are Stubs)

### 8.1 All 14 Scripts Are `TODO: implement` Stubs

Examined scripts:
- `scaffold-app.ts` — line 24: `TODO(M3): implement template rendering + adapter-aware theme-provider generation.`
- `index-ds-repo.ts` — line 27: `TODO(M1): port from the existing script + add MCP-parity normalization.`
- `start-dev-server.ts` — line 20: `TODO(M3): implement spawn + log-grep + healthcheck.`
- `triage-input.ts` — stub
- `index-ds-mcp.ts` — stub
- `extract-tokens.ts` — stub
- `extract-icons.ts` — stub
- `fetch-guidelines-web.ts` — stub
- `parse-guidelines-repo.ts` — stub
- `generate-guidelines-fallback.ts` — stub
- `install-deps.ts` — stub
- `validate-generated.ts` — stub
- `axe-run.ts` — stub
- `visual-smoke.ts` — stub

**Impact:** The scripts that could make the pipeline fast (deterministic TS parsing, fast scaffolding, automated validation) are **not implemented**. When the orchestrator invokes an agent and says "call `scripts/index-ds-repo.ts`", the agent either:
1. Has to implement the script's logic inline (slow, error-prone, repeats work), or
2. Returns a blocker because the script doesn't work.

This means the **mechanical work is being done by Sonnet-level agents instead of deterministic code**, which is orders of magnitude slower and more expensive.

### 8.2 No `package.json` or `tsconfig.json` at Skill Root

Per `plan.md` §13.1 Shippability Snapshot:
> "`package.json` / `tsconfig.json` at skill root: Missing — needed to run scripts"

**Impact:** Even if the scripts were implemented, there's no project setup to run them. The skill cannot execute its own tooling.

### 8.3 Only One DS Adapter Exists

Per `plan.md` §13.1:
> "At least one DS adapter: `../shared/ds-adapters/ant-design.json` exists (external) — only one"

**Impact:** The DS-agnostic claim (Rule 0) is not tested. Every new DS requires adapter authoring, which may fail and trigger healing loops.

---

## 9. Research & Market Analysis Overhead

### 9.1 Market Researcher Fetches 3+ Competitor Websites

Per `agents/market-researcher.md`:
> "Fetch each competitor's landing page, pricing page, and (if accessible) product tour."

**Impact:** 3 competitors × 2–3 pages = 6–9 WebFetch calls. Each fetch is network-bound and may take 5–15 seconds. If the page is JavaScript-heavy, the scrape quality may be poor, requiring retries.

### 9.2 Competitive Synthesizer Adds a Sequential Layer

Per `agents/orchestrator.md`:
> "competitive-synthesizer → docs/competitive-synthesis.md [lightweight, no new claims]"

**Impact:** Even though it's described as "lightweight," it's another Sonnet invocation that must read `market-research.md` and write a synthesis doc. It could be folded into the market-researcher or skipped if no new claims are added.

### 9.3 Research Cache Exists But Is Empty Until First Run

Per `plan.md` §0.1 v3.2 changes:
> "Research cache: `<memoryRoot>/research-cache/<domain>/` for cross-run research reuse."

**Impact:** The cache helps on re-runs, but first runs (which is what most users do) get zero benefit. Market research is done from scratch every time.

---

## 10. Context Window & Token Inefficiency

### 10.1 Every Agent Re-Reads the Full Planning Corpus

Per agent specs:
- `lead-designer` reads: IA, research, PRD, DS knowledge, guidelines, patterns, differentiation-map, market-research, theme-spec, themeability-report, premium-design-playbook, anti-generic-examples, surface-templates
- `developer` reads: build_specs, pattern_decisions, ds-extensions, ux-writing-pass, design-principal-critique, differentiation-map, DS knowledge, guidelines, patterns, theme-spec
- `design-qa` reads: app, all planning docs, dev-qa report, runtime report, guidelines, patterns, theme-spec, premium-aesthetic-standard, ai-generic-anti-patterns, anti-generic-examples, surface-templates

**Impact:** These context windows are **30K–80K tokens** per agent. Large context increases latency (models process context linearly) and cost. There's no embedding-based retrieval — every agent gets the full firehose.

### 10.2 Checkpoint Discipline Requires Re-Reading for Weaker LLMs

Per `rules/checkpoint-discipline.md`:
> "At Haiku-tier, conversation context past ~30K tokens becomes lossy. A weaker LLM... cannot reliably re-derive the design decisions from 'scroll back in the chat.' It can reliably open `<runRoot>/checkpoints/10-design-decisions.json` (4KB) and know exactly what was decided."

**Impact:** The checkpoint system is designed for weaker LLMs, but the pipeline primarily uses Sonnet. The overhead (21 checkpoint files, schema validation, disk I/O) is incurred even though Sonnet has strong conversation recall.

---

## 11. Summary Table of Issues by Severity

| # | Issue | Category | Severity | Estimated Time Impact |
|---|-------|----------|----------|----------------------|
| 1 | 25+ agents, mostly sequential | Architecture | **Critical** | +15–30 min baseline |
| 2 | 5 QA loops × 5 iterations max | QA | **Critical** | +20–60 min |
| 3 | Playwright runtime sweep (4 viewports × all routes × all interactions) | Runtime | **Critical** | +10–30 min |
| 4 | 3 human approval gates with mandatory wait | Human-in-loop | **Critical** | Unbounded (chat latency) |
| 5 | Design revision rounds (principal ↔ designer, aesthetic ↔ designer, judge ↔ designer) | Design | **Major** | +10–20 min |
| 6 | All 14 scripts are unimplemented stubs | Implementation | **Major** | +10–20 min (work done by agents) |
| 7 | `npm run build` + dev server boot on every patch cycle | Tooling | **Major** | +5–15 min |
| 8 | Playwright + Chromium download per run | Tooling | **Major** | +1–5 min |
| 9 | 16+ mandatory planning artifacts, all large markdown docs | Artifacts | **Major** | +5–10 min |
| 10 | Market research with 6–9 web fetches | Research | **Moderate** | +2–5 min |
| 11 | 21 checkpoint files written/re-read | I/O | **Moderate** | +1–3 min |
| 12 | Sonnet used for 18+ agents where Haiku might suffice | Model tier | **Moderate** | +5–10 min |
| 13 | No stage skipping allowed | Architecture | **Moderate** | +2–5 min |
| 14 | Full context re-read per agent (30K–80K tokens) | Token efficiency | **Moderate** | +3–8 min |
| 15 | axe-run on every route, every dev-qa iteration | QA | **Moderate** | +2–5 min |
| 16 | Commercial auditor forced sequential after design-qa | Parallelization | **Minor** | +2–4 min |
| 17 | Pattern memory I/O (reads + promotions + index regen) | I/O | **Minor** | +30–60 sec |
| 18 | Competitive synthesizer is a redundant sequential layer | Architecture | **Minor** | +1–2 min |
| 19 | Deliverable tally overhead per artifact | Artifacts | **Minor** | +30–60 sec |
| 20 | No skill-root package.json / tsconfig.json | Implementation | **Minor** | Blocks script execution |

---

## 12. Root Cause Analysis

The extreme runtime is not caused by any single bottleneck. It is the **compounding effect** of multiple architectural decisions that optimize for thoroughness and quality at the expense of speed:

1. **Thoroughness-first design:** Every stage has a dedicated agent, every output has a dedicated file, every decision has an audit trail, every QA finding triggers a heal loop. This is correct for a "product organization" metaphor but expensive for an AI pipeline.

2. **Zero-trust between agents:** Checkpoint discipline (Rule 23) means agents don't trust conversation context and re-read everything from disk. This adds I/O and latency.

3. **Pessimistic QA strategy:** 5 loops × 5 iterations with full runtime verification catches every bug but pays maximum cost even when the code is good.

4. **Human gate placement:** G1, G2, and G3 are positioned such that G2 (after 12 sequential agents) is the most likely place for iteration, meaning the most work is thrown away.

5. **Implementation debt:** The skill is a "complete specification" (plan.md §13.1) but not a "runnable pipeline." Scripts are stubs, so agents do mechanical work that should be deterministic code.

---

## 13. What Would Need to Change to Fix This

This section is for awareness only — the issues above are documented, not modified.

To significantly reduce runtime, the skill would need:

1. **Parallelize planning stages** where possible (research and PM could overlap; UX architect and lead-designer could collaborate)
2. **Collapse agents** — combine pattern-decider + lead-designer, combine design-principal + aesthetic-director, combine dev-qa + production-readiness-auditor
3. **Implement the scripts** so mechanical work (indexing, scaffolding, validation, axe) is fast deterministic code, not Sonnet prompts
4. **Make QA loops smarter** — batch issues across all 5 gates into a single heal cycle instead of 5 sequential loops
5. **Add a fast-path mode** — skip market research, skip differentiation mapping, skip commercial audit for users who just want a working app
6. **Cache aggressively** — DS indexes, guidelines, research, and patterns should be persistent and reused without agent invocation
7. **Replace G2 with an async review** — emit the plan summary and continue to code generation while waiting for user feedback, allowing the user to iterate post-hoc
8. **Downgrade model tiers** — use Haiku for deterministic tasks (triage, checkpoint I/O, report formatting, simple validations)
9. **Lazy-load Playwright** — only install if runtime-inspector is actually needed; skip if dev-qa already found critical failures
10. **Skip runtime verification on patch cycles** — if only a CSS fix was made, don't re-run the full modal + form + responsive sweep
