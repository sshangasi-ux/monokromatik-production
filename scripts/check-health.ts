#!/usr/bin/env node
/**
 * Failure / uptime monitor — the watcher for the watchers.
 *
 * Two checks, because today the Breaking Radar failed silently for 4 days and
 * nothing noticed:
 *   1. WORKFLOW HEALTH — for each scheduled automation, look at its recent runs;
 *      if none have succeeded lately (it's stuck failing/cancelled), flag it.
 *   2. ROUTE HEALTH — the key production URLs must return 2xx.
 *
 * Read-only. The workflow opens/updates a single tracking issue when anything is
 * unhealthy. Needs a GitHub token (GH_TOKEN/GITHUB_TOKEN) for the workflow check;
 * without one it checks routes only.
 *
 *   npx tsx scripts/check-health.ts
 */

import { writeFileSync, mkdirSync, appendFileSync } from 'fs';
import { join } from 'path';

const BASE = (process.env.HEALTH_BASE_URL || 'https://www.monokromatik.com').replace(/\/$/, '');
const REPO = process.env.GITHUB_REPOSITORY || 'sshangasi-ux/monokromatik-production';
const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';
const UA = 'MonoKromatikHealthMonitor';

// Scheduled automations that must keep succeeding. CI is excluded (PR failures
// are normal), and the monitor never flags itself.
const IGNORE_WORKFLOWS = new Set(['CI', 'Health Monitor']);
const FAIL_CONCLUSIONS = new Set(['failure', 'timed_out', 'startup_failure', 'cancelled']);
const WINDOW = 8; // how many recent completed runs to judge "stuck" by

const ROUTES = ['/', '/breaking', '/intelligence/signal-index', '/api/index', '/sitemap.xml', '/robots.txt', '/llms.txt'];

interface WorkflowIssue { name: string; detail: string; url: string; }
interface RouteDown { route: string; status: string; }

const report: string[] = [];
const log = (s: string) => { console.log(s); report.push(s); };

interface Run { name: string; conclusion: string | null; created_at: string; html_url: string; event: string; }

async function checkWorkflows(): Promise<WorkflowIssue[]> {
  if (!TOKEN) {
    log('## Workflow health\n- ⏭️ skipped (no GitHub token)');
    return [];
  }
  const res = await fetch(`https://api.github.com/repos/${REPO}/actions/runs?per_page=100&status=completed`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': UA },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    log(`## Workflow health\n- ⚠️ could not query the Actions API (HTTP ${res.status})`);
    return [];
  }
  const data = (await res.json()) as { workflow_runs?: Run[] };
  const runs = data.workflow_runs || [];

  // Group by workflow name, newest first.
  const byName = new Map<string, Run[]>();
  for (const r of runs) {
    if (IGNORE_WORKFLOWS.has(r.name)) continue;
    if (!byName.has(r.name)) byName.set(r.name, []);
    byName.get(r.name)!.push(r);
  }

  const issues: WorkflowIssue[] = [];
  log(`## Workflow health (${byName.size} automations)`);
  for (const [name, list] of byName) {
    const recent = list.slice(0, WINDOW);
    const succeeded = recent.some((r) => r.conclusion === 'success');
    if (succeeded) {
      log(`- ✅ ${name}`);
      continue;
    }
    // No success in the recent window — is it actually failing (vs only cancelled)?
    const bad = recent.filter((r) => FAIL_CONCLUSIONS.has(r.conclusion || ''));
    if (bad.length === 0) {
      log(`- ⚪ ${name} — no recent success, but no failures either (skipped/queued)`);
      continue;
    }
    const latest = recent[0];
    const detail = `no success in last ${recent.length} run(s); latest "${latest.conclusion}" at ${latest.created_at.replace('T', ' ').replace('Z', ' UTC')}`;
    issues.push({ name, detail, url: latest.html_url });
    log(`- 🔴 **${name}** — ${detail}`);
  }
  return issues;
}

async function checkRoutes(): Promise<RouteDown[]> {
  log(`\n## Route health — ${BASE}`);
  const down: RouteDown[] = [];
  for (const route of ROUTES) {
    try {
      const r = await fetch(`${BASE}${route}`, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(15_000) });
      if (r.ok) log(`- ✅ ${route} (${r.status})`);
      else { down.push({ route, status: `HTTP ${r.status}` }); log(`- 🔴 ${route} — HTTP ${r.status}`); }
    } catch (e) {
      down.push({ route, status: e instanceof Error ? e.message : 'unreachable' });
      log(`- 🔴 ${route} — unreachable`);
    }
  }
  return down;
}

async function main() {
  log(`# Health monitor — ${new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC\n`);
  const workflowIssues = await checkWorkflows();
  const routesDown = await checkRoutes();

  const problems = workflowIssues.length + routesDown.length;
  log(`\n**Summary: ${workflowIssues.length} workflow issue(s) · ${routesDown.length} route(s) down.**`);

  mkdirSync(join(process.cwd(), 'output'), { recursive: true });
  writeFileSync(
    join(process.cwd(), 'output/health.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), base: BASE, ok: problems === 0, workflowIssues, routesDown }, null, 2),
  );
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report.join('\n') + '\n');
}

main().catch((e) => { console.error('check-health failed:', e); process.exit(1); });
