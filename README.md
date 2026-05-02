# Monolith Skill

End-to-end AI agent workflow that turns a one-line product brief into a **market-grade**, documented, QA'd React app — against ANY design system. Drop-in skill for **Claude Code, Cursor, OpenCode, Gemini CLI, Trae, Windsurf, Kiro, and Aider.**

---

## Install

In your project directory, run:

```bash
npx monolith-skill init
```

That's it. The installer:

1. Detects which AI editors you have configured (`.claude/`, `.cursor/`, `.gemini/`, …).
2. Drops the skill markdown into each editor's skills folder.
3. Creates `.monolith/` at your project root with the runtime scripts and runs `npm install` there once.

Then in your editor:

```
/monolith build <your product brief>
```

### Install for a specific editor

```bash
npx monolith-skill init --editor claude,cursor
```

### Install for every supported editor

```bash
npx monolith-skill init --all
```

### List supported editors

```bash
npx monolith-skill list
```

### Update or remove

```bash
npx monolith-skill update    # re-copy skill files, keep .monolith/ state
npx monolith-skill remove    # uninstall everything from this project
```

---

## What gets installed

After `npx monolith-skill init`, your project gets:

```
your-project/
├── .monolith/                    ← runtime: scripts, node_modules, state
│   ├── agents/                   (24 agent prompts)
│   ├── rules/
│   ├── scripts/                  (TypeScript runtime: tsx, zod, playwright, …)
│   ├── package.json
│   ├── node_modules/             (auto-installed)
│   └── state.json                (created on first run)
│
└── .claude/skills/monolith/      ← markdown the editor reads (one per editor)
    ├── SKILL.md
    ├── agents/
    ├── rules/
    └── references/
```

**Nothing else is added to your project root.** Add `.monolith/` to your `.gitignore` if you don't want runtime state committed.

---

## What it does

Monolith orchestrates 24 specialized agents across:

- Market research & competitive synthesis
- Product research & PRD
- UX strategy & differentiation mapping
- Information architecture & user flows
- Design decisions with DS-extension gatekeeping
- Premium aesthetic auditing (anti-AI-generic)
- Engineering specs & pattern decisions
- React app generation (Vite + React + any DS)
- Five self-healing QA loops (dev-qa, production-readiness, runtime, design, commercial)
- Three approval gates (G1, G2, G3) — turn-yielding, you stay in control

**Entry point:** `.monolith/SKILL.md` (also mirrored into each editor's skills folder)
**Tutorial:** `.monolith/TUTORIAL.md`
**Quick start:** `.monolith/QUICKSTART.md`
**Troubleshooting:** `.monolith/TROUBLESHOOTING.md`

---

## Requirements

- Node.js ≥ 18
- An AI editor (Claude Code, Cursor, etc.)
- Optionally: Playwright browsers (the installer offers to fetch these on first run if needed)

---

## Contributing / development

Clone the repo, edit `src/skill/`, then test locally:

```bash
git clone https://github.com/abhiroopchaudhuri/monolith-skill.git
cd monolith-skill
node bin/monolith.js init --all     # installs into local dogfood folders
```

To publish a new version:

```bash
npm version patch    # bump version
npm pack --dry-run   # verify tarball contents
npm publish
```

---

## License

MIT — see [LICENSE](./LICENSE).
