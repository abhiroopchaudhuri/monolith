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

platforms.forEach((platform) => {
  const targetDir = path.join(__dirname, platform, 'skills', 'monolith');

  try {
    fs.mkdirSync(targetDir, { recursive: true });
    fs.cpSync(sourceDir, targetDir, { recursive: true, force: true });
    console.log(`  [OK]  ${platform}/skills/monolith`);
  } catch (err) {
    console.error(`  [FAIL] ${platform}/skills/monolith — ${err.message}`);
  }
});

console.log('\nDone. Remember to git add the updated folders before pushing.');
