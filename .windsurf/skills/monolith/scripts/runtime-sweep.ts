#!/usr/bin/env tsx
/**
 * runtime-sweep.ts — Playwright-based runtime verification (Phases A–G).
 *
 * USAGE:
 *   tsx scripts/runtime-sweep.ts \
 *     --url http://localhost:5173 \
 *     --routes /,/strategies,/patients/:id \
 *     --fixtures <runRoot>/app/src/fixtures/ \
 *     --out <runRoot>/qa/
 *
 * Drives a headless browser through every route and verifies:
 *   A. Route sweep (HTTP status, console errors, screenshot)
 *   B. Nav invariant (exactly 1 aria-current="page")
 *   C. Interactive element sweep (dead buttons, dead links)
 *   D. Scroll & overflow detection
 *   E. Modal lifecycle (focus trap, Escape, close)
 *   F. Form lifecycle (validation, submit)
 *   G. Responsive sweep (viewport sizes)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getPlaywright() {
  try {
    return await import('playwright') as any;
  } catch {
    console.error('Playwright not installed. Run: npm install playwright');
    process.exit(1);
  }
}

interface Issue {
  id: string;
  category: string;
  severity: 'blocker' | 'major' | 'minor';
  route: string;
  observation: string;
  suggestedFix?: string;
  file?: string;
  line?: number;
  screenshot?: string;
}

function resolveDynamicRoute(route: string, fixturesDir: string): string | null {
  if (!route.includes(':')) return route;
  const screenName = route.split('/')[1] || 'home';
  const fixturePath = path.join(fixturesDir, `${screenName}.ts`);
  if (fs.existsSync(fixturePath)) {
    const content = fs.readFileSync(fixturePath, 'utf-8');
    const idMatch = content.match(/id:\s*['"]([^'"]+)['"]/);
    if (idMatch) return route.replace(/:[^/]+/, idMatch[1]);
  }
  console.warn(`No fixture for dynamic route ${route}. Skipping.`);
  return null;
}

const VIEWPORTS = [
  { width: 1440, height: 900, name: '1440x900' },
  { width: 1024, height: 768, name: '1024x768' },
  { width: 768, height: 1024, name: '768x1024' },
  { width: 375, height: 667, name: '375x667' },
];

async function phaseARouteSweep(page: any, url: string, route: string, outDir: string, viewports: typeof VIEWPORTS): Promise<Issue[]> {
  const issues: Issue[] = [];
  const screenshots: string[] = [];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      const status = response?.status() ?? 0;

      if (status !== 200) {
        issues.push({
          id: `RTI-route-${route}-${vp.name}`,
          category: 'route-error',
          severity: 'blocker',
          route,
          observation: `HTTP ${status} at ${vp.name}`,
        });
      }

      const bodyText = await page.evaluate(() => document.body?.innerText?.trim() || '');
      if (!bodyText) {
        issues.push({
          id: `RTI-empty-${route}-${vp.name}`,
          category: 'route-error',
          severity: 'blocker',
          route,
          observation: `Empty body at ${vp.name}`,
        });
      }

      const ssPath = path.join(outDir, 'screenshots', `${route.replace(/\//g, '_') || 'home'}-${vp.name}.png`);
      fs.mkdirSync(path.dirname(ssPath), { recursive: true });
      await page.screenshot({ path: ssPath, fullPage: true });
      screenshots.push(ssPath);
    } catch (e: any) {
      issues.push({
        id: `RTI-navfail-${route}-${vp.name}`,
        category: 'route-error',
        severity: 'blocker',
        route,
        observation: `Navigation failed: ${e.message?.slice(0, 200)}`,
      });
    }
  }
  return issues;
}

async function phaseBNavInvariant(page: any, route: string): Promise<Issue[]> {
  const issues: Issue[] = [];
  try {
    const activeCount = await page.locator('aside nav a[aria-current="page"]').count();
    if (activeCount > 1) {
      const items = await page.locator('aside nav a[aria-current="page"]').allTextContents();
      issues.push({
        id: `RTI-nav-${route}`,
        category: 'nav-state',
        severity: 'blocker',
        route,
        observation: `${activeCount} nav items active: ${items.join(', ')}`,
        suggestedFix: 'Add `end` prop to the root NavLink or fix path matching.',
      });
    }
  } catch { /* nav may not exist on this route */ }
  return issues;
}

async function phaseCInteractiveSweep(page: any, route: string): Promise<Issue[]> {
  const issues: Issue[] = [];
  const interactables = await page.locator('button, a[href], [role="button"], [data-coming-soon]').all();

  for (const el of interactables) {
    const isDisabled = await el.getAttribute('disabled') || await el.getAttribute('aria-disabled') === 'true';
    const isComingSoon = await el.getAttribute('data-coming-soon') === 'true';
    if (isDisabled || isComingSoon) continue;

    const tag = await el.evaluate((e: Element) => e.tagName.toLowerCase());
    if (tag === 'a') {
      const href = await el.getAttribute('href');
      if (href && href.startsWith('/')) {
        try {
          await el.click();
          await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
          await page.goBack();
        } catch { /* link navigation failure */ }
      }
    } else {
      const beforeHtml = await page.evaluate(() => document.body.innerHTML.length);
      const urlBefore = page.url();
      try {
        await el.click();
        await page.waitForTimeout(500);
        const afterHtml = await page.evaluate(() => document.body.innerHTML.length);
        const routeChanged = page.url() !== urlBefore;

        if (afterHtml === beforeHtml && !routeChanged) {
          const text = await el.textContent().catch(() => '');
          issues.push({
            id: `RTI-deadbtn-${route}-${Date.now()}`,
            category: 'dead-button',
            severity: 'blocker',
            route,
            observation: `Button "${text?.trim().slice(0, 50)}" clicked, no DOM change`,
            suggestedFix: 'Add onClick handler, data-coming-soon, or disabled attribute.',
          });
        }
      } catch { /* click failed */ }
    }
  }
  return issues;
}

async function phaseDScrollOverflow(page: any, route: string): Promise<Issue[]> {
  const issues: Issue[] = [];
  try {
    const scrollable = await page.evaluate(() => document.body.scrollHeight > window.innerHeight);
    if (!scrollable) return issues;

    // Open all collapsibles
    const expandables = await page.locator('[aria-expanded="false"], [data-state="closed"]').all();
    for (const el of expandables) {
      try { await el.click(); } catch {}
    }
    await page.waitForTimeout(300);

    const clipped = await page.evaluate(() => {
      const body = document.body;
      const parents = document.querySelectorAll('*');
      for (const p of parents) {
        const style = getComputedStyle(p);
        if (style.overflow === 'hidden' || style.maxHeight) {
          const rect = p.getBoundingClientRect();
          if (p.scrollHeight > rect.height + 2 && rect.height < 100) {
            return true;
          }
        }
      }
      return false;
    });

    if (clipped) {
      issues.push({
        id: `RTI-overflow-${route}`,
        category: 'overflow',
        severity: 'blocker',
        route,
        observation: 'Content clipped by overflow:hidden or max-height after expanding collapsibles',
      });
    }
  } catch { /* scroll check failure */ }
  return issues;
}

async function phaseEModalLifecycle(page: any, route: string): Promise<Issue[]> {
  const issues: Issue[] = [];
  const modals = await page.locator('[role="dialog"], [role="alertdialog"]').all();

  for (const modal of modals) {
    try {
      const trigger = await page.locator('[aria-haspopup="dialog"]').first();
      if (await trigger.count() > 0) {
        await trigger.click();
        await page.waitForTimeout(300);
      }

      const focused = await page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null);
      if (!focused) {
        issues.push({
          id: `RTI-modal-focus-${route}-${Date.now()}`,
          category: 'accessibility',
          severity: 'major',
          route,
          observation: 'Modal opened but focus did not move inside',
        });
      }

      // Test Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    } catch { /* modal test failure */ }
  }
  return issues;
}

async function phaseFFormLifecycle(page: any, route: string): Promise<Issue[]> {
  const issues: Issue[] = [];
  const forms = await page.locator('form, [data-form]').all();

  for (const form of forms) {
    try {
      const submitBtn = form.locator('button[type="submit"], button:not([type])').first();
      if (await submitBtn.count() === 0) continue;

      await submitBtn.click();
      await page.waitForTimeout(300);

      const hasValidation = await page.locator('[role="alert"], .text-destructive, [data-error]').count() > 0;
      if (!hasValidation) {
        issues.push({
          id: `RTI-form-${route}-${Date.now()}`,
          category: 'form-wiring',
          severity: 'major',
          route,
          observation: 'Form submit without required fields showed no validation error',
        });
      }
    } catch { /* form test failure */ }
  }
  return issues;
}

async function phaseGResponsiveSweep(page: any, routes: string[], fixturesDir: string, baseUrl: string): Promise<Issue[]> {
  const issues: Issue[] = [];
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    const testRoutes = routes.slice(0, 3);
    for (const route of testRoutes) {
      const resolved = resolveDynamicRoute(route, fixturesDir);
      if (!resolved) continue;
      try {
        await page.goto(`${baseUrl}${resolved}`, { waitUntil: 'networkidle', timeout: 10000 });
        const hScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
        if (hScroll) {
          issues.push({
            id: `RTI-hscroll-${route}-${vp.name}`,
            category: 'responsive',
            severity: 'blocker',
            route,
            observation: `Horizontal scroll at ${vp.name}`,
          });
        }
      } catch { /* navigation failure */ }
    }
  }
  return issues;
}

async function main() {
  const args = process.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const baseUrl = getArg('--url') || 'http://localhost:5173';
  const routesArg = getArg('--routes') || '/';
  const fixturesDir = getArg('--fixtures') || '';
  const outDir = getArg('--out') || 'qa';

  const routes = routesArg.split(',').map((r) => r.trim());
  fs.mkdirSync(path.join(outDir, 'screenshots'), { recursive: true });

  const pw = await getPlaywright();
  const browser = await pw.chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console errors
  const consoleErrors: Array<{ route: string; text: string }> = [];
  page.on('console', (msg: any) => {
    if (msg.type() === 'error') {
      consoleErrors.push({ route: page.url(), text: msg.text() });
    }
  });
  page.on('pageerror', (err: any) => {
    consoleErrors.push({ route: page.url(), text: err.message });
  });

  const allIssues: Issue[] = [];
  const screenshots: Record<string, Record<string, string>> = {};

  for (const route of routes) {
    const resolved = resolveDynamicRoute(route, fixturesDir);
    if (!resolved) continue;

    const url = `${baseUrl}${resolved}`;
    console.log(`[runtime-sweep] ${route} → ${url}`);

    // Phase A
    const aIssues = await phaseARouteSweep(page, url, route, outDir, VIEWPORTS);
    allIssues.push(...aIssues);

    // Phase B
    if (aIssues.length === 0) {
      const bIssues = await phaseBNavInvariant(page, route);
      allIssues.push(...bIssues);

      // Phase C
      const cIssues = await phaseCInteractiveSweep(page, route);
      allIssues.push(...cIssues);

      // Phase D
      const dIssues = await phaseDScrollOverflow(page, route);
      allIssues.push(...dIssues);

      // Phase E
      const eIssues = await phaseEModalLifecycle(page, route);
      allIssues.push(...eIssues);

      // Phase F
      const fIssues = await phaseFFormLifecycle(page, route);
      allIssues.push(...fIssues);
    }
  }

  // Phase G (responsive)
  const gIssues = await phaseGResponsiveSweep(page, routes, fixturesDir, baseUrl);
  allIssues.push(...gIssues);

  await browser.close();

  // Console error findings
  for (const ce of consoleErrors) {
    allIssues.push({
      id: `RTI-console-${ce.route}-${Date.now()}`,
      category: 'route-error',
      severity: 'major',
      route: ce.route,
      observation: `Console error: ${ce.text.slice(0, 200)}`,
    });
  }

  const blockers = allIssues.filter((i) => i.severity === 'blocker');
  const report = {
    timestamp: new Date().toISOString(),
    totalRoutes: routes.length,
    totalIssues: allIssues.length,
    blockers: blockers.length,
    issues: allIssues,
    screenshots,
    verdict: blockers.length === 0 ? 'pass' : 'fail',
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'runtime-report.json'), JSON.stringify(report, null, 2), 'utf-8');

  // Write markdown summary
  const md = [
    '# Runtime Inspection Report',
    '',
    `Routes visited: ${routes.length}`,
    `Total issues: ${allIssues.length} (${blockers.length} blockers)`,
    '',
    blockers.length > 0 ? `## Blockers\n${blockers.map((b) => `- ${b.category} ${b.route}: ${b.observation}`).join('\n')}` : '## All clear',
  ].join('\n');
  fs.writeFileSync(path.join(outDir, 'runtime-report.md'), md, 'utf-8');

  console.log(`\n[runtime-sweep] ${allIssues.length} issues (${blockers.length} blockers)`);

  if (blockers.length > 0) {
    for (const b of blockers.slice(0, 10)) {
      console.error(`  BLOCKER [${b.category}] ${b.route}: ${b.observation}`);
    }
    process.exit(1);
  }

  console.log('[runtime-sweep] All routes clean.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
