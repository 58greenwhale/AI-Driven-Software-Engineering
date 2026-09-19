import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { chromium } from '@playwright/test';
import { appRoot, localConfig } from './env.mjs';

// Independent AC-09 runner: only the handoff's isolated service/database are allowed.
const phase = process.argv[2];
if (!/^[a-z][a-z0-9-]{0,35}$/.test(phase ?? '')) throw new Error('Supply a safe run label');
const startedAt = new Date().toISOString();
const runId = `${phase}-${startedAt.replace(/[:.]/g, '-')}`;
const evidenceRoot = path.resolve(appRoot, '../evidence/maintenance/permission');
fs.mkdirSync(evidenceRoot, { recursive: true });
const resultFile = path.join(evidenceRoot, `${runId}.json`);
const candidateRoot = path.join(appRoot, '.runtime/permission-drill');
const projectId = '20000000-0000-4000-8000-000000000001';
const base = 'http://127.0.0.1:3213';
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const result = {
  runId, phase, startedAt, node: process.version,
  command: `node scripts/accept-permission-drill.mjs ${phase}`,
  criterion: 'TASK-001 AC-09', target: base, database: 'focustask_drill',
  projectId, expected: { status: 403, taskDelta: 0, idempotencyDelta: 0, createButtonCount: 0 },
  observations: {}, conclusion: '阻塞',
};
let db;
let browser;
let stage = 'validate-target';
function manifest(root, entries) {
  const rows = [];
  const walk = relative => {
    const file = path.join(root, relative);
    if (fs.statSync(file).isDirectory()) {
      for (const name of fs.readdirSync(file).sort()) walk(path.join(relative, name));
    } else rows.push([relative, sha(fs.readFileSync(file))]);
  };
  entries.forEach(walk);
  return { sha256: sha(JSON.stringify(rows)), files: rows };
}
async function request(route, options = {}) {
  const response = await fetch(`${base}${route}`, {
    ...options, redirect: 'error', signal: AbortSignal.timeout(15000),
  });
  const body = await response.json();
  return { response, body };
}
const check = (condition, code) => { if (!condition) throw Object.assign(new Error(code), { safeCode: code }); };

try {
  // Read only synthetic configuration internally; never print secrets, cookies or URLs with credentials.
  const config = localConfig('drill');
  const databaseTarget = new URL(config.DATABASE_URL);
  check(config.APP_BASE_URL === base && config.FOCUSTASK_ENV === 'drill', 'UNEXPECTED_SERVICE_TARGET');
  check(databaseTarget.hostname === '127.0.0.1' && databaseTarget.port === '55461'
    && databaseTarget.pathname === '/focustask_drill', 'UNEXPECTED_DATABASE_TARGET');
  result.databasePort = Number(databaseTarget.port);
  result.scriptSha256 = sha(fs.readFileSync(import.meta.filename));
  result.candidate = {
    source: manifest(candidateRoot, ['src', 'prisma', 'package.json', 'package-lock.json', 'next.config.mjs']),
    taskServiceSha256: sha(fs.readFileSync(path.join(candidateRoot, 'src/server/tasks.ts'))),
    buildId: fs.readFileSync(path.join(candidateRoot, '.next/BUILD_ID'), 'utf8').trim(),
    serverBuild: manifest(path.join(candidateRoot, '.next'), ['server']),
  };
  result.specifications = ['features/TASK-001-create-task.md', 'permissions.md', 'empirical-contracts.md'].map(relative =>
    [relative, sha(fs.readFileSync(path.resolve(appRoot, '../docs', relative)))]);

  stage = 'health';
  const health = await request('/api/v1/health');
  result.observations.health = { status: health.response.status, ...health.body.data };
  check(health.response.status === 200, 'HEALTH_FAILED');
  stage = 'authenticate-viewer';
  const login = await request('/api/v1/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base },
    body: JSON.stringify({ email: 'viewer@example.test', password: config.FOCUSTASK_SEED_PASSWORD }),
  });
  result.observations.loginStatus = login.response.status;
  check(login.response.status === 200 && typeof login.body.data?.id === 'string', 'LOGIN_FAILED');
  const cookieHeader = login.response.headers.get('set-cookie');
  check(Boolean(cookieHeader), 'SESSION_COOKIE_MISSING');
  const cookie = cookieHeader.split(';')[0];
  const headers = { Cookie: cookie, Origin: base };
  db = new PrismaClient({ datasources: { db: { url: config.DATABASE_URL } }, log: [] });
  const member = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: login.body.data.id } }, select: { role: true },
  });
  const detail = await request(`/api/v1/projects/${projectId}`, { headers });
  result.observations.identity = { userId: login.body.data.id, databaseRole: member?.role, apiRole: detail.body.data?.project.role };
  check(member?.role === 'viewer' && detail.body.data?.project.role === 'viewer', 'VIEWER_ROLE_NOT_CONFIRMED');

  async function snapshot() {
    const list = await request(`/api/v1/projects/${projectId}/tasks`, { headers });
    check(list.response.status === 200 && Number.isInteger(list.body.data?.total), 'LIST_FAILED');
    const tasks = await db.task.findMany({ where: { projectId }, orderBy: { id: 'asc' }, select: { id: true, title: true, status: true, assigneeId: true, dueDate: true, createdBy: true, version: true, createdAt: true, updatedAt: true } });
    const idempotencyCount = await db.idempotency.count({ where: { projectId } });
    return { apiStatus: list.response.status, apiTotal: list.body.data.total, databaseCount: tasks.length,
      taskIds: tasks.map(task => task.id), taskDataSha256: sha(JSON.stringify(tasks)), idempotencyCount };
  }

  stage = 'viewer-write-and-counts';
  result.observations.before = await snapshot();
  const idempotencyKey = crypto.randomUUID();
  const title = `DRILL-001 independent Viewer ${runId}`;
  const create = await request(`/api/v1/projects/${projectId}/tasks`, {
    method: 'POST', headers: { ...headers, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({ title, assigneeId: null, dueDate: null }),
  });
  result.observations.create = { status: create.response.status, idempotencyKey, title,
    errorCode: create.body.error?.code ?? null, taskId: create.body.data?.id ?? null,
    requestId: create.body.error?.requestId ?? create.response.headers.get('x-request-id') };
  result.observations.after = await snapshot();
  const { before, after } = result.observations;
  result.observations.taskDelta = after.databaseCount - before.databaseCount;
  result.observations.idempotencyDelta = after.idempotencyCount - before.idempotencyCount;
  result.observations.newTaskIds = after.taskIds.filter(id => !before.taskIds.includes(id));
  result.apiAndDatabaseConclusion = create.response.status === 403
    && before.taskDataSha256 === after.taskDataSha256
    && before.idempotencyCount === after.idempotencyCount
    && before.apiTotal === before.databaseCount && after.apiTotal === after.databaseCount ? '通过' : '失败';
  result.conclusion = result.apiAndDatabaseConclusion;

  stage = 'viewer-ui';
  try {
    browser = await chromium.launch({ channel: 'chromium' });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const separator = cookie.indexOf('=');
    await context.addCookies([{ name: cookie.slice(0, separator), value: cookie.slice(separator + 1), url: base, httpOnly: true, sameSite: 'Lax' }]);
    const page = await context.newPage();
    await page.goto(`${base}/projects/${projectId}/tasks`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: detail.body.data.project.name, exact: true }).waitFor();
    const buttonCount = await page.getByRole('button', { name: '新建任务', exact: true }).count();
    const screenshot = `${runId}-viewer.png`;
    await page.screenshot({ path: path.join(evidenceRoot, screenshot), fullPage: true });
    result.observations.ui = { createButtonCount: buttonCount, screenshot, conclusion: buttonCount === 0 ? '通过' : '失败' };
    if (buttonCount !== 0) result.conclusion = '失败';
  } catch (error) {
    result.observations.ui = { conclusion: '阻塞', errorType: error.name, stage };
    if (result.conclusion !== '失败') result.conclusion = '阻塞';
  }
} catch (error) {
  result.error = { stage, code: error.safeCode ?? error.code ?? 'OPERATION_FAILED', type: error.name };
  if (result.conclusion !== '失败') result.conclusion = '阻塞';
} finally {
  if (browser) await browser.close().catch(() => {});
  if (db) await db.$disconnect().catch(() => {});
  result.finishedAt = new Date().toISOString();
  result.exitCode = result.conclusion === '通过' ? 0 : result.conclusion === '失败' ? 1 : 2;
  fs.writeFileSync(resultFile, `${JSON.stringify(result, null, 2)}\n`, { flag: 'wx' });
  console.log(JSON.stringify({ file: path.relative(appRoot, resultFile), conclusion: result.conclusion,
    status: result.observations.create?.status, before: result.observations.before?.databaseCount,
    after: result.observations.after?.databaseCount, taskId: result.observations.create?.taskId,
    requestId: result.observations.create?.requestId, ui: result.observations.ui, error: result.error }, null, 2));
  process.exitCode = result.exitCode;
}
