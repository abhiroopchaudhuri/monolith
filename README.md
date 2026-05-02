# Monolith

> **End-to-end market-grade product build.** A single command from brief to running React app — against ANY design system.

[![Drop-in Skill](https://img.shields.io/badge/drop--in-skill-blue)](.opencode/skills/monolith/)
[![Editors](https://img.shields.io/badge/editors-Claude%20%7C%20Cursor%20%7C%20OpenCode%20%7C%20Trae%20%7C%20Gemini-orange)]()

---

## What is Monolith?

Monolith is a **multi-agent AI skill / workflow** that transforms a one-line product brief into a fully-researched, fully-designed, **production-grade** React application running on localhost.

It behaves as a complete product organization:

| Real org role | This skill's agent |
|---|---|
| Market / competitive researcher (+ inlined synthesis) | `market-researcher` |
| Product researcher | `researcher` |
| Product manager | `product-manager` |
| UX strategist | `ux-strategist` |
| UX architect | `ux-architect` |
| Lead designer | `lead-designer` |
| DS principles gatekeeper | `ds-extension-judge` |
| Principal designer (critic) | `design-principal` |
| Aesthetic director | `aesthetic-director` |
| UX writer | `ux-writer` |
| Engineering manager | `engineering-manager` |
| Pattern librarian | `pattern-decider` |
| Software engineer | `developer` |
| QA engineer | `dev-qa`, `design-qa`, `runtime-inspector` |
| Commercial auditor | `commercial-auditor` |
| Self-healing engineer | `self-healer` |
| Project conductor | `orchestrator` |

### What makes it different

- **Market-grade, not MVP-grade.** Real competitor research, explicit differentiation bets, commercial viability audit.
- **Anti-AI-generic.** Prescriptive OKLCH color discipline, hairline borders, tiered shadows, named motion curves. No pastel-circle empty states.
- **DS-agnostic.** Works with shadcn, MUI, Chakra, Radix, Mantine, Ant Design, Adobe Spectrum, custom DS, or any MCP server.
- **Five self-healing QA loops.** dev-qa → production-readiness → runtime-inspector → design-qa → commercial-auditor. Each iterates until clean or blocks.
- **Three approval gates.** G1 (input, blocking) and G2/G3 (turn-yielding — the orchestrator stops and waits for your reply, no background work). No silent progress.
- **Portable output.** Nothing writes inside the skill folder. Every run produces artifacts outside it.
- **Zero-dependency runtime.** Single `.monolith/state.json` source of truth, no SQLite, no Git branching, no custom RAG. Works in a plain folder.

---

## Supported Editors (Drop-in)

Monolith ships as a **drop-in skill** for every major AI coding editor. No configuration needed — just clone and the editor auto-discovers it.

| Editor | Discovery path | Trigger command |
|---|---|---|
| **Claude Code** | `.claude/skills/monolith/SKILL.md` | `/monolith build <brief>` |
| **Cursor** | `.cursor/skills/monolith/SKILL.md` | `/monolith build <brief>` |
| **OpenCode** | `.opencode/skills/monolith/SKILL.md` | `/monolith build <brief>` |
| **Trae** | `.trae/skills/monolith/SKILL.md` | `/monolith build <brief>` |
| **Gemini editors** | `.gemini/skills/monolith/SKILL.md` | `/monolith build <brief>` |

---

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/your-org/monolith.git
cd monolith
```

### 2. Invoke in your editor

```
/monolith build an internal expense-reporting tool for a mid-sized org.
  - DS: mcp:your-ds-mcp
  - Guidelines: auto
  - Theme: light
  - Density: comfortable
  - Locale: en-US
```

### 3. Approve three gates

- **G1 — Input:** Confirm app name, DS source, theming inputs.
- **G2 — Plan:** Review PRD, differentiation map, design decisions, build specs.
- **G3 — Delivery:** Accept the running app + artifact package.

---

## Repo Structure

```
monolith/
|
├── src/monolith/                    <-- MASTER COPY (edit only here)
│   ├── agents/                      # 20+ agent prompts
│   ├── rules/                       # Enforceable doctrines
│   ├── templates/                   # Code scaffolding (.hbs)
│   ├── docs-templates/              # Markdown artifact templates
│   ├── scripts/                     # TypeScript utilities
│   ├── guidelines-schema/           # JSON schemas
│   ├── references/                  # Curated playbooks
│   ├── prompts/                     # Reusable system-prompt seeds
│   ├── SKILL.md                     # Skill entry point
│   ├── plan.md                      # Master plan & tracker
│   ├── README.md                    # Maintainer docs
│   ├── QUICKSTART.md                # 5-minute walkthrough
│   └── TUTORIAL.md                  # Full scenario guide
|
├── .claude/skills/monolith/         # Auto-synced for Claude Code
├── .cursor/skills/monolith/         # Auto-synced for Cursor
├── .opencode/skills/monolith/       # Auto-synced for OpenCode
├── .trae/skills/monolith/           # Auto-synced for Trae
├── .gemini/skills/monolith/         # Auto-synced for Gemini
|
├── AGENTS.md                        # OpenCode trigger docs
├── CLAUDE.md                        # Claude Code trigger docs
├── .cursorrules                     # Cursor trigger docs
├── sync-skills.js                   # One-click sync script
└── README.md                        # This file
```

### How the sync works

Never edit the `.claude/`, `.cursor/`, `.opencode/`, etc. folders directly.

1. **Edit only `src/monolith/`.**
2. **Run `node sync-skills.js`.**
3. **Commit everything.**

The script copies `src/monolith/` into every editor-specific folder automatically.

```bash
node sync-skills.js
```

---

## The Pipeline (v3.3)

```
triage -> [G1 blocking] ->

Track A (discovery, parallel + cacheable):
  ds-indexer  ||  guidelines-resolver  ||  market-researcher
                       -> theming-resolver -> researcher

Track B (planning, parallel):
  product-manager  ||  ux-strategist
       -> ux-architect  ||  lead-designer (early draft)

Track C (design quality):
  ds-extension-judge (batch all extension requests)
  -> design-principal  ||  aesthetic-director (parallel critique)
  -> ux-writer -> engineering-manager

[G2 turn-yield: edit .monolith/scratchpad/* and reply continue/iterate/restart] ->

  pattern-decider -> developer ->

Unified QA loop (Solution 3):
  Iteration 1 (parallel):
    dev-qa || production-readiness || runtime-inspector || design-qa || commercial-auditor
       -> aggregate issues -> self-healer -> developer (one patch + patchManifest)
  Iteration 2+ (delta-routed by patchManifest, max 5 iterations per gate)

[G3 turn-yield: accept / iterate / abort] -> DELIVERY.md + localhost URL
```

**Unified QA loop, 5 gates** with delta-routing. Max 5 iterations per gate. Hard-block with escalation otherwise.

---

## Output Layout (v3.3)

Every run produces a portable artifact tree outside the skill folder:

```
<workspaceRoot>/
├── monolith/                          # Skill (read-only during runs)
├── .monolith/                         # State tree + scratchpad + cache + archive
│   ├── state.json                     # Single source of truth (Rule 23)
│   ├── scratchpad/                    # Live planning artifacts during the run
│   │   ├── market-research.md         # (with inlined ## Synthesis appendix)
│   │   ├── research.md
│   │   ├── prd.md
│   │   ├── differentiation-map.md
│   │   ├── information_architecture.md
│   │   ├── user_flow.md
│   │   ├── design_decisions.md
│   │   ├── design-principal-critique.md
│   │   ├── aesthetic-audit.md
│   │   ├── ds-extensions/<slug>.md
│   │   ├── ux-writing-pass.md
│   │   ├── build_specs.md
│   │   ├── pattern_decisions.md
│   │   ├── commercial-audit.md
│   │   ├── qa.md
│   │   └── PLANNING_REVIEW.md         # Rendered for G2 review
│   ├── archive/<runId>/               # Scratchpad moves here on G3 accept
│   └── cache/<tier>/<hash>/           # Content-addressable cache for cacheable phases
├── .monolith-memory/patterns/         # Persistent pattern memory (cross-run, append-only log.jsonl)
└── <appName>/                         # The running React app
    ├── src/
    ├── qa/                            # Per-gate QA reports
    └── DELIVERY.md
```

**Why turn-yielding G2/G3?** The orchestrator outputs the gate message and stops. Nothing runs in the background. You can edit any file in `.monolith/scratchpad/` directly, then reply on your next turn. The orchestrator detects edits via `scratchpad-lifecycle.ts detect-edits` and re-runs only the dirty phases.

---

## Core Rules

| # | Rule | Purpose |
|---|---|---|
| 0 | DS-First Mandate | No raw HTML primitives without proof |
| 8 | Output Location | Skill folder is read-only during runs |
| 9 | Production-Grade Mandate | Every button wired, every state reachable |
| 10 | Self-Healing QA Loop | Iterate until clean, max 5 times |
| 11 | Runtime Verification | Headless browser sweep before G3 |
| 12 | Market Research Mandate | Competitor analysis before any design |
| 13 | Differentiation Mandate | 3-5 explicit differentiator bets |
| 19 | Premium Aesthetic Standard | Prescriptive OKLCH / type / motion / depth |
| 20 | AI-Generic Anti-Patterns | 25-item scannable blacklist |
| 21 | Theming Input Normalization | Any input -> one canonical theme-spec.json |
| 22 | DS Themeability Taxonomy | Tier 1-4 classification with fallback paths |
| 23 | Checkpoint Discipline | Disk as source of truth between agents |
| 24 | Phase Manifest Discipline | Every agent declares reads/writes |
| 25 | Artifact Size Cap | 10K tokens per planning artifact |
| 26 | Deliverable Tally | Delivered: X | Remaining: Y per artifact |

---

## Contributing

1. Edit files in `src/monolith/` only.
2. Run `node sync-skills.js`.
3. Open a PR with both `src/` and the synced `.editor/` folders.

See `src/monolith/plan.md` for the full spec, build order, and tracker.

---

## License

MIT
