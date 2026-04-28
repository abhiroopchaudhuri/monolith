# Monolith Skill — Claude Code Trigger

> **For Claude Code users.** This repo contains a drop-in AI skill under `.claude/skills/monolith/`.
>
> To invoke the skill, use: `/monolith build <product brief>`

## Quick start

1. Clone or copy this repo into your workspace.
2. Claude Code automatically discovers `.claude/skills/monolith/SKILL.md`.
3. In chat, type: `/monolith build <your product brief>`

## What it does

Monolith is an end-to-end agent workflow that turns a one-line product brief into a **market-grade**, documented, QA'd React app — against ANY design system.

It orchestrates 20+ specialized agents across:
- Market research & competitive synthesis
- Product research & PRD
- UX strategy & differentiation mapping
- Information architecture & user flows
- Design decisions with DS-extension gatekeeping
- Premium aesthetic auditing (anti-AI-generic)
- Engineering specs & pattern decisions
- React app generation (Vite + React + any DS)
- Five self-healing QA loops (dev-qa, production-readiness, runtime, design, commercial)
- Three approval gates (G1, G2, G3)

## Workflow docs

- **Entry point:** `.claude/skills/monolith/SKILL.md`
- **Master plan:** `.claude/skills/monolith/plan.md`
- **User tutorial:** `.claude/skills/monolith/TUTORIAL.md`
- **Quick start:** `.claude/skills/monolith/QUICKSTART.md`

## Updating

If you edit `src/monolith/`, run `node sync-skills.js` to regenerate all editor folders.
