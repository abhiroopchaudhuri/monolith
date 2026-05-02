import fs from 'node:fs';
import path from 'node:path';

export const EDITORS = {
  claude:   { marker: '.claude',   dir: '.claude/skills/monolith',   label: 'Claude Code' },
  cursor:   { marker: '.cursor',   dir: '.cursor/skills/monolith',   label: 'Cursor' },
  opencode: { marker: '.opencode', dir: '.opencode/skills/monolith', label: 'OpenCode' },
  trae:     { marker: '.trae',     dir: '.trae/skills/monolith',     label: 'Trae' },
  gemini:   { marker: '.gemini',   dir: '.gemini/skills/monolith',   label: 'Gemini CLI' },
  windsurf: { marker: '.windsurf', dir: '.windsurf/skills/monolith', label: 'Windsurf' },
  kiro:     { marker: '.kiro',     dir: '.kiro/skills/monolith',     label: 'Kiro' },
  aider:    { marker: '.aider',    dir: '.aider/skills/monolith',    label: 'Aider' },
};

export function detectEditors(cwd) {
  return Object.entries(EDITORS)
    .filter(([, { marker }]) => fs.existsSync(path.join(cwd, marker)))
    .map(([key]) => key);
}
