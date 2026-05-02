#!/usr/bin/env tsx
/**
 * state-manager.ts — Unified state tree manager for Monolith v3.3
 *
 * All agents and scripts read/write pipeline state through this single interface.
 * The state tree lives at .monolith/state.json and replaces:
 *   - 21 checkpoint JSON files
 *   - SQLite database
 *   - Separate artifact metadata files
 *   - Issue tracking files
 *
 * USAGE:
 *   import { StateManager } from './state-manager.ts';
 *   const sm = new StateManager('.monolith/state.json');
 *   sm.readState('phases.dsIndexer.checkpoint');
 *   sm.writeState('phases.dsIndexer.status', 'done');
 *   sm.atomicWrite({ ...fullState });
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IssueSchema {
  id: string;
  gate: string;
  attempt: number;
  severity: 'blocker' | 'major' | 'minor';
  category: string;
  location?: { file?: string; line?: number; route?: string };
  observation: string;
  suggestedFix?: string;
}

export interface PatchManifest {
  touchedFiles: string[];
  touchedRoutes?: string[];
  touchedComponents?: string[];
  changeType: 'logic' | 'css' | 'routing' | 'copy' | 'form' | 'modal' | 'layout';
  estimatedImpact: {
    staticGates: string[];
    runtimeGates: string[];
    designGates: string[];
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getValueAtPath(obj: any, dotPath: string): any {
  const keys = dotPath.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    current = current[key];
  }
  return current;
}

function setValueAtPath(obj: any, dotPath: string, value: any): void {
  const keys = dotPath.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

function deepMerge(target: any, source: any): any {
  if (source === null || source === undefined) return target;
  if (typeof source !== 'object') return source;
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      typeof source[key] === 'object' &&
      source[key] !== null &&
      !Array.isArray(source[key]) &&
      typeof result[key] === 'object' &&
      result[key] !== null &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function computeHash(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex').slice(0, 16);
}

// ---------------------------------------------------------------------------
// Default state skeleton
// ---------------------------------------------------------------------------

function createDefaultState(runId: string, brief: string): any {
  return {
    meta: {
      version: '3.3.0',
      runId,
      startedAt: new Date().toISOString(),
      status: 'planning',
    },
    input: {
      manifest: { brief },
      fingerprint: computeHash(brief + runId),
      lastPatchManifest: null,
    },
    cache: {},
    phases: {
      triage: { status: 'pending' },
      dsIndexer: { status: 'pending' },
      guidelinesResolver: { status: 'pending' },
      themingResolver: { status: 'pending' },
      marketResearcher: { status: 'pending' },
      researcher: { status: 'pending' },
      productManager: { status: 'pending' },
      uxStrategist: { status: 'pending' },
      uxArchitect: { status: 'pending' },
      leadDesigner: { status: 'pending' },
      dsExtensionJudge: { status: 'pending' },
      designPrincipal: { status: 'pending' },
      aestheticDirector: { status: 'pending' },
      uxWriter: { status: 'pending' },
      engineeringManager: { status: 'pending' },
      patternDecider: { status: 'pending' },
      developer: { status: 'pending' },
      devQa: { status: 'pending' },
      productionReadiness: { status: 'pending' },
      runtimeInspector: { status: 'pending' },
      designQa: { status: 'pending' },
      commercialAuditor: { status: 'pending' },
    },
    artifacts: {},
    qa: {
      devQa: { attempts: 0, lastIssues: [], status: 'pending' },
      productionReadiness: { attempts: 0, lastIssues: [], status: 'pending' },
      runtimeInspector: { attempts: 0, lastIssues: [], status: 'pending' },
      designQa: { attempts: 0, lastIssues: [], status: 'pending' },
      commercialAuditor: { attempts: 0, lastIssues: [], status: 'pending' },
    },
    issues: { open: [], resolved: [], waived: [] },
    healLog: [],
    patterns: { reused: [], promotedThisRun: [] },
  };
}

// ---------------------------------------------------------------------------
// StateManager
// ---------------------------------------------------------------------------

export class StateManager {
  private statePath: string;
  private scratchpadDir: string;
  private cacheDir: string;
  private patternsLogPath: string;

  constructor(statePath: string = '.monolith/state.json') {
    this.statePath = path.resolve(statePath);
    this.scratchpadDir = path.resolve('.monolith/scratchpad');
    this.cacheDir = path.resolve('.monolith/cache');
    this.patternsLogPath = path.resolve('.monolith/patterns/log.jsonl');

    // Ensure directories exist
    fs.mkdirSync(path.dirname(this.statePath), { recursive: true });
    fs.mkdirSync(this.scratchpadDir, { recursive: true });
    fs.mkdirSync(this.cacheDir, { recursive: true });
    fs.mkdirSync(path.dirname(this.patternsLogPath), { recursive: true });
  }

  // -------------------------------------------------------------------------
  // Core I/O
  // -------------------------------------------------------------------------

  /** Read the full state tree. */
  readState(): any {
    if (!fs.existsSync(this.statePath)) {
      return null;
    }
    const raw = fs.readFileSync(this.statePath, 'utf-8');
    return JSON.parse(raw);
  }

  /** Read a specific branch via dot-path. Returns undefined if path missing. */
  readBranch(dotPath: string): any {
    const state = this.readState();
    if (!state) return undefined;
    return getValueAtPath(state, dotPath);
  }

  /** Deep-merge a value into a specific branch via dot-path. */
  writeBranch(dotPath: string, value: any): void {
    const state = this.readState() || {};
    const current = getValueAtPath(state, dotPath);
    const merged = typeof current === 'object' && current !== null && typeof value === 'object'
      ? deepMerge(current, value)
      : value;
    setValueAtPath(state, dotPath, merged);
    this.atomicWrite(state);
  }

  /** Replace the entire state atomically. */
  atomicWrite(state: any): void {
    const tmp = this.statePath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf-8');
    fs.renameSync(tmp, this.statePath);
  }

  /** Initialize a new run. Creates fresh state.json. */
  init(runId: string, brief: string): void {
    const state = createDefaultState(runId, brief);
    this.atomicWrite(state);
  }

  // -------------------------------------------------------------------------
  // Phase helpers
  // -------------------------------------------------------------------------

  setPhaseStatus(phase: string, status: string, checkpoint?: any): void {
    const update: any = { status };
    if (checkpoint) update.checkpoint = checkpoint;
    if (status === 'active') update.startedAt = new Date().toISOString();
    if (status === 'done' || status === 'failed' || status === 'skipped') {
      update.completedAt = new Date().toISOString();
    }
    this.writeBranch(`phases.${phase}`, update);
  }

  getPhaseStatus(phase: string): string | undefined {
    return this.readBranch(`phases.${phase}.status`);
  }

  // -------------------------------------------------------------------------
  // Artifact helpers
  // -------------------------------------------------------------------------

  setArtifact(
    name: string,
    summary: string,
    fullPath: string,
    tokenCount?: number
  ): void {
    const absPath = path.resolve(fullPath);
    const mtime = fs.existsSync(absPath)
      ? fs.statSync(absPath).mtime.toISOString()
      : new Date().toISOString();
    this.writeBranch(`artifacts.${name}`, {
      summary,
      fullPath,
      tokenCount: tokenCount ?? 0,
      lastModified: mtime,
      version: (this.readBranch(`artifacts.${name}.version`) || 0) + 1,
    });
  }

  getArtifact(name: string): any {
    return this.readBranch(`artifacts.${name}`);
  }

  getArtifactSummary(name: string): string | undefined {
    return this.readBranch(`artifacts.${name}.summary`);
  }

  // -------------------------------------------------------------------------
  // Fingerprint / cache helpers
  // -------------------------------------------------------------------------

  getFingerprint(phase: string): string | undefined {
    return this.readBranch(`phases.${phase}.fingerprint`);
  }

  setFingerprint(phase: string, inputHash: string, outputHash?: string): void {
    this.writeBranch(`phases.${phase}.fingerprint`, inputHash);
    if (outputHash) {
      this.writeBranch(`phases.${phase}.outputHash`, outputHash);
    }
  }

  checkFingerprint(phase: string, inputHash: string): { match: boolean; storedHash: string | undefined } {
    const storedHash = this.getFingerprint(phase);
    return { match: storedHash === inputHash, storedHash };
  }

  cacheGet(type: string, inputHash: string): string | null {
    const entry = this.readBranch(`cache.${type}`);
    if (entry && entry.key === inputHash) {
      const fullPath = path.resolve(entry.path);
      if (fs.existsSync(fullPath)) return fullPath;
    }
    return null;
  }

  cacheSet(type: string, inputHash: string, outputPath: string, ttlDays?: number): void {
    const entry: any = { key: inputHash, path: path.relative(process.cwd(), outputPath) };
    if (ttlDays) {
      const d = new Date();
      d.setDate(d.getDate() + ttlDays);
      entry.expiresAt = d.toISOString();
    }
    this.writeBranch(`cache.${type}`, entry);
  }

  // -------------------------------------------------------------------------
  // Issue helpers
  // -------------------------------------------------------------------------

  addIssue(gate: string, attempt: number, issue: IssueSchema): void {
    this.writeBranch('issues.open', [
      ...(this.readBranch('issues.open') || []),
      issue,
    ]);
  }

  resolveIssue(issueId: string): void {
    const open: IssueSchema[] = this.readBranch('issues.open') || [];
    const idx = open.findIndex((i) => i.id === issueId);
    if (idx === -1) return;
    const [issue] = open.splice(idx, 1);
    this.writeBranch('issues.open', open);
    this.writeBranch('issues.resolved', [
      ...(this.readBranch('issues.resolved') || []),
      issue,
    ]);
  }

  getOpenIssues(gate?: string): IssueSchema[] {
    const all: IssueSchema[] = this.readBranch('issues.open') || [];
    return gate ? all.filter((i) => i.gate === gate) : all;
  }

  // -------------------------------------------------------------------------
  // QA gate helpers
  // -------------------------------------------------------------------------

  setQaStatus(gate: string, status: string, attempt?: number, issues?: string[]): void {
    const update: any = { status };
    if (typeof attempt === 'number') update.attempts = attempt;
    if (issues) update.lastIssues = issues;
    this.writeBranch(`qa.${gate}`, update);
  }

  getQaStatus(gate: string): any {
    return this.readBranch(`qa.${gate}`);
  }

  // -------------------------------------------------------------------------
  // Heal log helpers
  // -------------------------------------------------------------------------

  addHealEntry(gate: string, attempt: number, issuesCount: number, patchManifest?: PatchManifest): void {
    const entry: any = {
      gate,
      attempt,
      issuesCount,
      timestamp: new Date().toISOString(),
    };
    if (patchManifest) entry.patchManifest = patchManifest;
    this.writeBranch('healLog', [
      ...(this.readBranch('healLog') || []),
      entry,
    ]);
  }

  // -------------------------------------------------------------------------
  // Pattern helpers
  // -------------------------------------------------------------------------

  addPattern(slug: string, content: object): void {
    const line = JSON.stringify({ slug, content, createdAt: new Date().toISOString() }) + '\n';
    fs.appendFileSync(this.patternsLogPath, line, 'utf-8');
  }

  getPattern(slug: string): any {
    if (!fs.existsSync(this.patternsLogPath)) return null;
    const lines = fs.readFileSync(this.patternsLogPath, 'utf-8').split('\n').filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const entry = JSON.parse(lines[i]);
        if (entry.slug === slug) return entry.content;
      } catch { /* skip corrupt line */ }
    }
    return null;
  }

  listPatterns(): string[] {
    if (!fs.existsSync(this.patternsLogPath)) return [];
    const slugs = new Set<string>();
    const lines = fs.readFileSync(this.patternsLogPath, 'utf-8').split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        slugs.add(entry.slug);
      } catch { /* skip */ }
    }
    return Array.from(slugs);
  }

  // -------------------------------------------------------------------------
  // Server helpers
  // -------------------------------------------------------------------------

  setServerState(pid: number, url: string, status: string): void {
    this.writeBranch('server', { pid, url, status });
  }

  getServerState(): any {
    return this.readBranch('server');
  }

  // -------------------------------------------------------------------------
  // Scratchpad / archive helpers
  // -------------------------------------------------------------------------

  getScratchpadDir(): string {
    return this.scratchpadDir;
  }

  archiveScratchpad(runId: string): string {
    const archiveDir = path.resolve('.monolith/archive', runId);
    fs.mkdirSync(archiveDir, { recursive: true });
    if (fs.existsSync(this.scratchpadDir)) {
      const entries = fs.readdirSync(this.scratchpadDir, { withFileTypes: true });
      for (const entry of entries) {
        const src = path.join(this.scratchpadDir, entry.name);
        const dest = path.join(archiveDir, entry.name);
        if (entry.isDirectory()) {
          fs.cpSync(src, dest, { recursive: true });
        } else {
          fs.copyFileSync(src, dest);
        }
      }
    }
    return archiveDir;
  }

  clearScratchpad(): void {
    if (fs.existsSync(this.scratchpadDir)) {
      const entries = fs.readdirSync(this.scratchpadDir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(this.scratchpadDir, entry.name);
        if (entry.isDirectory()) {
          fs.rmSync(full, { recursive: true, force: true });
        } else {
          fs.unlinkSync(full);
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // Utility
  // -------------------------------------------------------------------------

  /** Store the latest patch manifest for delta QA. */
  setPatchManifest(manifest: PatchManifest): void {
    this.writeBranch('input.lastPatchManifest', manifest);
  }

  /** Get the latest patch manifest. */
  getPatchManifest(): PatchManifest | undefined {
    return this.readBranch('input.lastPatchManifest') || undefined;
  }

  /** Check if scratchpad files were modified since last artifact registration. */
  detectUserEdits(): string[] {
    const artifacts: Record<string, any> = this.readBranch('artifacts') || {};
    const dirty: string[] = [];
    for (const [name, meta] of Object.entries(artifacts)) {
      if (!meta || typeof meta !== 'object') continue;
      const fp = (meta as Record<string, unknown>).fullPath as string | undefined;
      const lastMod = (meta as Record<string, unknown>).lastModified as string | undefined;
      if (!fp || !lastMod) continue;
      const absPath = path.resolve(fp);
      if (!fs.existsSync(absPath)) continue;
      const stat = fs.statSync(absPath);
      if (stat.mtime.toISOString() !== lastMod) {
        dirty.push(name);
      }
    }
    return dirty;
  }

  /** Compute affected gates from a patch manifest. */
  getAffectedGates(patchManifest: PatchManifest): string[] {
    const gateMap: Record<string, string[]> = {
      logic: ['dev-qa', 'production-readiness', 'runtime-inspector'],
      css: ['design-qa', 'visual-smoke'],
      routing: ['dev-qa', 'runtime-inspector'],
      copy: ['design-qa', 'commercial-auditor'],
      form: ['runtime-inspector', 'production-readiness'],
      modal: ['runtime-inspector', 'production-readiness'],
      layout: ['runtime-inspector', 'design-qa'],
    };

    const gates = new Set<string>(gateMap[patchManifest.changeType] || []);

    // Conservative override: if changeType says css but touched .tsx with JSX, add logic gates
    if (patchManifest.changeType === 'css') {
      const hasTsx = patchManifest.touchedFiles.some((f) => f.endsWith('.tsx'));
      if (hasTsx) {
        gateMap.logic.forEach((g) => gates.add(g));
      }
    }

    return Array.from(gates);
  }

  /** Export a clean summary of the current run for debugging. */
  toSummary(): string {
    const state = this.readState();
    if (!state) return 'No state found.';
    const phases = state.phases || {};
    const done = Object.entries(phases).filter(([, v]: [string, any]) => v.status === 'done' || v.status === 'skipped').length;
    const total = Object.keys(phases).length;
    return `Run: ${state.meta?.runId || 'unknown'} | Status: ${state.meta?.status || 'unknown'} | Phases: ${done}/${total} done`;
  }
}

// ---------------------------------------------------------------------------
// CLI entry point (for debugging / manual state manipulation)
// ---------------------------------------------------------------------------

import { fileURLToPath } from 'url';
const _selfPath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(_selfPath) === path.resolve(process.argv[1])) {
  const [, , cmd, ...args] = process.argv;
  const sm = new StateManager();

  switch (cmd) {
    case 'init': {
      const [runId, brief] = args;
      sm.init(runId || 'default-run', brief || '');
      console.log(sm.toSummary());
      break;
    }
    case 'read': {
      const [dotPath] = args;
      console.log(JSON.stringify(sm.readBranch(dotPath || ''), null, 2));
      break;
    }
    case 'write': {
      const [dotPath, value] = args;
      sm.writeBranch(dotPath, JSON.parse(value));
      console.log('OK');
      break;
    }
    case 'summary': {
      console.log(sm.toSummary());
      break;
    }
    default:
      console.log('Usage: tsx state-manager.ts [init <runId> <brief> | read <path> | write <path> <json> | summary]');
  }
}
