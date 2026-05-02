#!/usr/bin/env tsx
/**
 * triage-input.ts — Stage 0 classifier.
 *
 * USAGE:
 *   tsx scripts/triage-input.ts \
 *     --brief "<verbatim brief>" \
 *     [--ds-mcp <mcp-name>] [--ds-repo <path>] [--ds-adapter <path>] \
 *     [--guidelines-files <csv>] [--guidelines-url <url>] \
 *     [--theme light|dark|both] [--density compact|comfortable|spacious] \
 *     [--locale en-US]
 *
 * Emits an input manifest into the state tree at `input.manifest`.
 * Fills `unresolved[]` with concrete questions if classification is ambiguous.
 */

import fs from 'fs';
import path from 'path';
import { StateManager } from './state-manager.js';

function kebabSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

function deriveRunId(brief: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const slug = kebabSlug(brief);
  return `${date}_${slug || 'untitled'}`;
}

function detectPromptType(brief: string): 'screen' | 'product' | 'ambiguous' {
  const screenPatterns = /\b(build|create|make|generate)\s+(a|an)\s+(screen|page|component|modal|dialog|form|table|chart|dashboard|card|list)\b/i;
  const productPatterns = /\b(build|create|make|generate)\s+(a|an)\s+(app|product|platform|tool|service|system|website|web app)\b/i;
  const hasScreen = screenPatterns.test(brief);
  const hasProduct = productPatterns.test(brief);
  if (hasScreen && !hasProduct) return 'screen';
  if (hasProduct && !hasScreen) return 'product';
  return 'ambiguous';
}

function main() {
  const args = process.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };
  const hasFlag = (flag: string): boolean => args.includes(flag);

  const brief = getArg('--brief');
  if (!brief) {
    console.error('Usage: tsx scripts/triage-input.ts --brief "..." [...options]');
    process.exit(1);
  }

  const dsMcp = getArg('--ds-mcp');
  const dsRepo = getArg('--ds-repo');
  const dsAdapter = getArg('--ds-adapter');
  const guidelinesFiles = getArg('--guidelines-files');
  const guidelinesUrl = getArg('--guidelines-url');
  const theme = getArg('--theme') ?? 'both';
  const density = getArg('--density') ?? 'comfortable';
  const locale = getArg('--locale') ?? 'en-US';

  const unresolved: string[] = [];

  // Validate DS sources
  const dsSources: string[] = [];
  if (dsMcp) dsSources.push(`mcp:${dsMcp}`);
  if (dsRepo) {
    if (!fs.existsSync(dsRepo)) {
      unresolved.push(`DS repo path does not exist: ${dsRepo}`);
    } else {
      dsSources.push(`repo:${dsRepo}`);
    }
  }
  if (dsAdapter) {
    if (!fs.existsSync(dsAdapter)) {
      unresolved.push(`DS adapter file does not exist: ${dsAdapter}`);
    }
  }
  if (dsSources.length === 0) {
    unresolved.push('No design system source specified (--ds-mcp or --ds-repo).');
  }

  // Validate guidelines sources
  const guidelinesSources: string[] = [];
  if (guidelinesFiles) {
    const files = guidelinesFiles.split(',').map((f) => f.trim());
    const missing = files.filter((f) => !fs.existsSync(f));
    if (missing.length) {
      unresolved.push(`Guidelines files missing: ${missing.join(', ')}`);
    } else {
      guidelinesSources.push(...files.map((f) => `file:${f}`));
    }
  }
  if (guidelinesUrl) {
    guidelinesSources.push(`url:${guidelinesUrl}`);
  }
  if (guidelinesSources.length === 0) {
    unresolved.push('No guidelines source specified (--guidelines-files or --guidelines-url). Fallback synthesis will be used.');
  }

  const promptType = detectPromptType(brief);
  if (promptType === 'ambiguous') {
    unresolved.push('Prompt type is ambiguous — is this a single screen or a full product?');
  }

  const runId = deriveRunId(brief);
  const appName = runId.replace(/^\d{4}-\d{2}-\d{2}_/, '').slice(0, 40) || 'monolith-app';
  const workspaceRoot = process.cwd();
  const runRoot = path.join(workspaceRoot, appName);
  const manifest = {
    runId,
    appName,
    brief,
    promptType,
    paths: {
      workspaceRoot,
      workflowRoot: path.join(workspaceRoot, 'monolith'),
      memoryRoot: path.join(workspaceRoot, '.monolith-memory'),
      runRoot,
      appRoot: runRoot,
    },
    ds: {
      sources: dsSources,
      adapter: dsAdapter ?? null,
    },
    guidelines: {
      sources: guidelinesSources,
    },
    constraints: {
      theme: theme as 'light' | 'dark' | 'both',
      density: density as 'compact' | 'comfortable' | 'spacious',
      locale,
    },
    unresolved: unresolved.length ? unresolved : [],
  };

  const state = new StateManager('.monolith/state.json');
  state.writeBranch('meta', { runId, version: '3.3.0', status: 'triaged' });
  state.writeBranch('input.manifest', manifest);
  state.writeBranch('phases.triage', {
    status: unresolved.length ? 'needs-clarification' : 'done',
    checkpoint: { manifestSummary: { briefLength: brief.length, promptType, dsSources: dsSources.length, guidelinesSources: guidelinesSources.length } },
  });

  console.log(JSON.stringify(manifest, null, 2));
}

main();
