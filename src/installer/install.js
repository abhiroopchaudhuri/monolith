import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EDITORS, detectEditors } from './editors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, '..', '..');
const SKILL_SRC = path.join(PACKAGE_ROOT, 'src', 'skill');

// Items in src/skill/ that should NOT go into editor folders
// (they belong only in the operational .monolith/ folder).
const EDITOR_SKIP = new Set(['node_modules', 'package-lock.json', 'scripts', 'tsconfig.json']);

// Items that should NOT go into .monolith/ either (dev-only).
const MONOLITH_SKIP = new Set(['node_modules', 'package-lock.json']);

function copyTree(src, dest, skip = new Set()) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    if (skip.has(entry)) continue;
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    fs.cpSync(s, d, { recursive: true, force: true });
  }
}

export function install({ cwd = process.cwd(), editors, all = false, force = false } = {}) {
  if (!fs.existsSync(SKILL_SRC)) {
    throw new Error(`Skill source not found at ${SKILL_SRC}`);
  }

  // Decide target editors
  let targets;
  if (editors && editors.length) {
    targets = editors;
  } else if (all) {
    targets = Object.keys(EDITORS);
  } else {
    targets = detectEditors(cwd);
    if (!targets.length) {
      console.log('No editor folders detected (.claude, .cursor, .opencode, …).');
      console.log('Pass --all to install for every supported editor, or --editor claude,cursor.');
      return;
    }
  }

  const unknown = targets.filter((t) => !EDITORS[t]);
  if (unknown.length) {
    throw new Error(`Unknown editor(s): ${unknown.join(', ')}. Supported: ${Object.keys(EDITORS).join(', ')}`);
  }

  // 1. Install operational copy at <cwd>/.monolith/
  const monolithDir = path.join(cwd, '.monolith');
  if (fs.existsSync(monolithDir) && !force) {
    console.log(`.monolith/ already exists — keeping existing node_modules and state.`);
    // Re-copy non-runtime files only (markdown + scripts), preserve node_modules and state.json
    for (const entry of fs.readdirSync(SKILL_SRC)) {
      if (MONOLITH_SKIP.has(entry)) continue;
      if (entry === 'package.json' && fs.existsSync(path.join(monolithDir, 'package.json'))) continue;
      fs.cpSync(path.join(SKILL_SRC, entry), path.join(monolithDir, entry), { recursive: true, force: true });
    }
  } else {
    if (force && fs.existsSync(monolithDir)) {
      fs.rmSync(monolithDir, { recursive: true, force: true });
    }
    copyTree(SKILL_SRC, monolithDir, MONOLITH_SKIP);
    console.log(`  [created] .monolith/`);
  }

  // 2. Install npm deps inside .monolith/
  if (!fs.existsSync(path.join(monolithDir, 'node_modules'))) {
    console.log(`  [install] running npm install in .monolith/ (this may take a minute)…`);
    try {
      execSync('npm install --omit=dev --no-audit --no-fund --loglevel=error', {
        cwd: monolithDir,
        stdio: 'inherit',
      });
    } catch (err) {
      console.error(`  [warn] npm install failed: ${err.message}`);
      console.error(`  Run "npm install" manually inside ${monolithDir}`);
    }
  } else {
    console.log(`  [skip]    .monolith/node_modules already present`);
  }

  // 3. Install lightweight skill copy into each editor folder
  for (const key of targets) {
    const { dir, label } = EDITORS[key];
    const targetDir = path.join(cwd, dir);
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
    copyTree(SKILL_SRC, targetDir, EDITOR_SKIP);
    console.log(`  [created] ${dir}  (${label})`);
  }

  console.log(`\nDone. In your editor, type:  /monolith build <your product brief>`);
}

export function remove({ cwd = process.cwd() } = {}) {
  const monolithDir = path.join(cwd, '.monolith');
  if (fs.existsSync(monolithDir)) {
    fs.rmSync(monolithDir, { recursive: true, force: true });
    console.log(`  [removed] .monolith/`);
  }
  for (const { dir, label } of Object.values(EDITORS)) {
    const targetDir = path.join(cwd, dir);
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
      console.log(`  [removed] ${dir}  (${label})`);
    }
  }
}
