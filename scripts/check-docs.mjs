import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--root' || !args[1])) {
  console.error('Usage: node scripts/check-docs.mjs [--root <directory>]');
  process.exit(2);
}
const root = args.length ? path.resolve(args[1]) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ignored = new Set(['.git', 'node_modules', '.next', '.runtime', 'test-results', 'playwright-report']);
const errors = [];
const files = [];
function readText(file, label = path.relative(root, file)) {
  try {
    if (!fs.statSync(file).isFile()) throw new Error('not a file');
    return fs.readFileSync(file, 'utf8');
  } catch {
    errors.push(`${label}: missing or unreadable file`);
    return null;
  }
}
function walk(directory) {
  let entries;
  try { entries = fs.readdirSync(directory, { withFileTypes: true }); }
  catch { errors.push(`${directory}: missing or unreadable directory`); return; }
  for (const entry of entries) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(full);
  }
}
walk(root);
const slugs = (source) => {
  const counts = new Map();
  return new Set([...source.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) => {
    const base = match[1].toLowerCase().replace(/[^\p{L}\p{N}_\-\s]/gu, '').replace(/\s/g, '-');
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    return count ? `${base}-${count}` : base;
  }));
};
let links = 0;
for (const file of files) {
  const relative = path.relative(root, file);
  const source = readText(file);
  if (source === null) continue;
  let fence;
  for (const [index, line] of source.split('\n').entries()) {
    const at = `${relative}:${index + 1}`;
    const mark = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (mark) {
      if (!fence) fence = mark[1];
      else if (mark[1][0] === fence[0] && mark[1].length >= fence.length) fence = undefined;
      continue;
    }
    if (/[\t ]+$/.test(line)) errors.push(`${at}: trailing whitespace`);
    if (fence) continue;
    // Validate the simple inline local links used by these documents, not example code.
    for (const match of line.matchAll(/\[[^\]]*\]\((<[^>]+>|[^\s)]+)(?:\s+"[^"]*")?\)/g)) {
      const href = match[1].replace(/^<|>$/g, '');
      if (/^[a-z]+:/i.test(href)) continue;
      links++;
      const [targetPath, anchor] = href.split('#');
      let decodedPath, decodedAnchor;
      try {
        decodedPath = decodeURIComponent(targetPath || path.basename(file));
        decodedAnchor = anchor ? decodeURIComponent(anchor) : undefined;
      } catch { errors.push(`${at}: invalid link encoding ${href}`); continue; }
      const target = path.resolve(path.dirname(file), decodedPath);
      if (!fs.existsSync(target)) { errors.push(`${at}: missing link target ${href}`); continue; }
      if (anchor && fs.statSync(target).isFile()) {
        const content = readText(target);
        if (content !== null && !slugs(content).has(decodedAnchor) && !content.includes(`id="${decodedAnchor}"`)) errors.push(`${at}: missing anchor ${href}`);
      }
    }
  }
  if (fence) errors.push(`${relative}: unclosed code fence`);
  if (!source.startsWith('# ')) errors.push(`${relative}: missing document title`);
}

const indexText = readText(path.join(root, 'model/artifact-index.json'));
let artifacts = [];
if (indexText !== null) {
  try {
    const parsed = JSON.parse(indexText);
    if (!Array.isArray(parsed)) throw new Error('not an array');
    artifacts = parsed;
  } catch { errors.push('model/artifact-index.json: expected a JSON array'); }
}
const promptTypes = ['START', 'CLARIFY', 'SELECT', 'GENERATE', 'REVIEW', 'REVISE', 'VERIFY', 'HANDOFF', 'FAILURE'];
const expectedIds = Array.from({ length: 22 }, (_, i) => `A${String(i + 1).padStart(2, '0')}`);
const ids = new Set(artifacts.map((item) => item?.id));
if (artifacts.length !== 22 || ids.size !== 22 || expectedIds.some((id) => !ids.has(id))) errors.push('Expected 22 unique artifact types A01-A22');
for (const item of artifacts) {
  if (!item || typeof item !== 'object' || typeof item.id !== 'string' || typeof item.title !== 'string') {
    errors.push('Invalid artifact entry: id and title are required');
    continue;
  }
  const texts = {};
  for (const type of ['spec', 'template', 'example']) {
    if (typeof item[type] !== 'string' || !item[type]) {
      errors.push(`${item.id}: missing ${type} path`);
      continue;
    }
    texts[type] = readText(path.resolve(root, item[type]), `${item.id}: ${type} ${item[type]}`);
  }
  if (typeof texts.spec === 'string') {
    for (const type of promptTypes) if (!texts.spec.includes(`[${item.id}-${type}]`)) errors.push(`${item.id}: missing ${type} prompt`);
    if (!texts.spec.includes('## 必填内容与字段含义') || !texts.spec.includes('## 质量标准与边界')) errors.push(`${item.id}: missing content or quality specification`);
  }
  if (typeof texts.example === 'string' && (!texts.example.includes('教学填写示例') || !texts.example.includes('不作通过结论'))) errors.push(`${item.id}: example lacks evidence boundary`);
}
// Detailed prototype activity guides are still a v0.3 deliverable.
const stages = { verification: 'VAL', release: 'REL', maintenance: 'MAINT' };
for (const [stage, prefix] of Object.entries(stages)) {
  const source = readText(path.join(root, `model/stages/${stage}.md`));
  if (source === null) continue;
  for (const key of ['START', 'DECIDE', 'GENERATE', 'REVIEW', 'VERIFY', 'HANDOFF', 'RECOVER']) {
    if (!source.includes(`[${prefix}-${key}]`)) errors.push(`${stage}: missing ${key} prompt`);
  }
}
console.log(JSON.stringify({ files: files.length, localLinks: links, artifacts: artifacts.length, stages: Object.keys(stages).length, errors }, null, 2));
process.exitCode = errors.length ? 1 : 0;
