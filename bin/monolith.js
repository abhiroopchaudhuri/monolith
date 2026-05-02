#!/usr/bin/env node
import { install, remove } from '../src/installer/install.js';
import { EDITORS } from '../src/installer/editors.js';

const args = process.argv.slice(2);
const cmd = args[0];

function parseFlags(rest) {
  const flags = { editors: null, all: false, force: false };
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === '--all') flags.all = true;
    else if (a === '--force' || a === '-f') flags.force = true;
    else if (a === '--editor' || a === '--editors') {
      flags.editors = (rest[++i] || '').split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return flags;
}

function help() {
  console.log(`monolith-skill — install the Monolith AI agent skill into your project.

Usage:
  npx monolith-skill <command> [options]

Commands:
  init                   Install skill into detected editor folders + create .monolith/
  init --all             Install for every supported editor
  init --editor a,b,c    Install for specific editors only
  init --force           Overwrite existing .monolith/ (loses local state)
  update                 Re-copy skill files (preserves .monolith/node_modules and state)
  remove                 Uninstall skill from this project
  list                   List supported editors
  help                   Show this message

Supported editors: ${Object.keys(EDITORS).join(', ')}

Examples:
  cd my-project
  npx monolith-skill init
  npx monolith-skill init --editor claude,cursor
  npx monolith-skill remove
`);
}

try {
  switch (cmd) {
    case 'init': {
      const f = parseFlags(args.slice(1));
      install(f);
      break;
    }
    case 'update': {
      install({ ...parseFlags(args.slice(1)), force: false });
      break;
    }
    case 'remove':
    case 'uninstall':
      remove();
      break;
    case 'list':
      for (const [key, { label, dir }] of Object.entries(EDITORS)) {
        console.log(`  ${key.padEnd(10)} ${label.padEnd(15)} → ${dir}`);
      }
      break;
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      help();
      break;
    default:
      console.error(`Unknown command: ${cmd}\n`);
      help();
      process.exit(1);
  }
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
