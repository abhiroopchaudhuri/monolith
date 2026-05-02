const fs = require('fs');
const path = require('path');

// ============================================================================
// MONOLITH SKILL SYNC SCRIPT
// ============================================================================
// Usage: node sync-skills.js
//
// This script copies the master skill from src/monolith/ into every
// editor-specific drop-in folder. Run this after any edit to src/monolith/
// before committing / pushing.
// ============================================================================

const sourceDir = path.join(__dirname, 'src', 'monolith');

const platforms = [
  '.claude',
  '.cursor',
  '.opencode',
  '.trae',
  '.gemini',
  '.kiro',
  '.rovodev',
  '.windsurf',
  '.aider',
];

if (!fs.existsSync(sourceDir)) {
  console.error(`Source directory not found: ${sourceDir}`);
  process.exit(1);
}

// Items inside src/monolith/ we never want to copy to editor folders.
const SKIP_NAMES = new Set(['node_modules', '.monolith', 'dist']);

platforms.forEach((platform) => {
  const targetDir = path.join(__dirname, platform, 'skills', 'monolith');

  try {
    // Clear the target first so deletes in src/monolith/ propagate.
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
    fs.mkdirSync(targetDir, { recursive: true });

    // Copy everything from source EXCEPT the skip list.
    for (const entry of fs.readdirSync(sourceDir)) {
      if (SKIP_NAMES.has(entry)) continue;
      fs.cpSync(
        path.join(sourceDir, entry),
        path.join(targetDir, entry),
        { recursive: true, force: true }
      );
    }
    console.log(`  [OK]  ${platform}/skills/monolith`);
  } catch (err) {
    console.error(`  [FAIL] ${platform}/skills/monolith — ${err.message}`);
  }
});

console.log('\nDone. Remember to git add the updated folders before pushing.');
