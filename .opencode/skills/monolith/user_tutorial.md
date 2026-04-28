# How to Run Phase 1 Standalone

This guide contains everything you need to know to invoke and run the `monolith` skill effectively.

## The Initial Prompt

To start a run, you need to provide the orchestrator with your context, constraints, and brief. You can copy and paste the following template into your chat:

```text
Read monolith/SKILL.md and act as the orchestrator per monolith/agents/orchestrator.md.

Run the full v3 pipeline end-to-end against:

- DS: repo:./<your-ds-folder-name>
- Guidelines: auto
- Theme: light
- Density: comfortable
- Locale: en-US
- ProductType: <consumer-saas | b2b-saas | internal-tool | regulated-tool | developer-tool>

Brief:
<paste your brief, OR>
PRD: ./prd.md
Reference: ./reference.png

Proceed through every stage. Stop ONLY at G1, G2, G3. Run every self-healing QA loop to convergence. Spawn subagents as the workflow dictates.
```

### Input Parameters Explained
- **DS**: Where your Design System lives. Can be `mcp:<name>`, `repo:<path>`, or `both:mcp:<name>,repo:<path>`.
- **Guidelines**: Where your design guidelines live. Can be `auto` (generates fallbacks), `files:<paths-csv>`, `url:<link>`, or `repo-inline`.
- **Theme**: `light`, `dark`, or `both`.
- **Density**: `compact`, `comfortable`, or `spacious`.
- **Locale**: e.g., `en-US`.
- **ProductType**: Helps the agents calibrate their research and commercial audits.

## Mode Flags

You can append mode flags to your invocation to change how much of the pipeline runs and how interactive it is.

- `--full` (default): Runs the entire pipeline through to a running React app.
- `--themeOnly`: Runs triage + ds-indexer + guidelines-resolver + theming-resolver, then stops. Produces a `theme-spec.json` and `themeability-report.md`. Useful to check if your DS and brand can work together.
- `--planOnly`: Runs discovery, research, design, and specs up through Gate 2, then stops. No app is built.
- `--lazy`: Skips interactive G1 and G2 prompts. The system auto-answers with documented defaults. Gate 3 is still interactive. Useful for ergonomic re-runs.
- `--UXR`: Research synthesis only. Produces `market-research.md` and `research.md`. No design, no build.
- `--noPRD`: Skips PRD generation. Everything else runs normally.

*Example with flags:*
```text
Run the v3 pipeline --planOnly --lazy against...
```

## The Three Approval Gates

Unless you use `--lazy`, the orchestrator will explicitly stop at three gates. **Nothing silently advances past these gates.**

1. **G1 (Input Gate)**
   - **When:** Right after triage.
   - **What it does:** Shows you the parsed input manifest and any unresolved fields.
   - **How to respond:** `ok` or `proceed` to continue, `change <field> to <value>` to edit, or `abort`.

2. **G2 (Plan Gate)**
   - **When:** After all planning docs (research, PRD, IA, user flow, design decisions, etc.) are written.
   - **What it does:** Gives you a condensed summary of the plan before expensive code generation begins.
   - **How to respond:** `ok` to continue, `iterate on <doc>: <delta>` (e.g., `iterate on prd: MVP is too big...`), `restart from <stage>`, or `abort`.

3. **G3 (Delivery Gate)**
   - **When:** After the app is built and all self-healing QA loops (dev, design, commercial, etc.) have run to convergence.
   - **What it does:** Presents the final localhost URL, the delivery summary, and QA reports.
   - **How to respond:** `accept`, `iterate on <stage>: <delta>`, `log` (accept with known gaps), or `abort`.

## Self-Healing QA Loops

Before reaching G3, the system automatically runs several QA loops:
- **dev-qa**: Checks TypeScript, ESLint, build, and DS_FIRST static rules.
- **production-readiness**: Audits for production standards.
- **runtime-inspector**: Checks the running app.
- **design-qa**: Evaluates visual rhythm, copy, token coverage, and state completeness.
- **commercial-auditor**: Grades the output for market viability.

If an agent fails a check, the orchestrator will spawn a `self-healer` or `developer (patch mode)` to fix the issue and re-run the QA loop until it passes (converges) or hits a hard limit. You do not need to intervene during these loops unless the system explicitly asks for help.