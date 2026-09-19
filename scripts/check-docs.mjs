import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ignored = new Set(['.git', 'node_modules', '.next', '.runtime', 'baseline', 'test-results', 'playwright-report']);
const errors = [];
const files = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
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
  const source = fs.readFileSync(file, 'utf8');
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
      const target = path.resolve(path.dirname(file), decodeURIComponent(targetPath || path.basename(file)));
      if (!fs.existsSync(target)) { errors.push(`${at}: missing link target ${href}`); continue; }
      if (anchor && fs.statSync(target).isFile()) {
        const content = fs.readFileSync(target, 'utf8');
        const decoded = decodeURIComponent(anchor);
        if (!slugs(content).has(decoded) && !content.includes(`id="${decoded}"`)) errors.push(`${at}: missing anchor ${href}`);
      }
    }
  }
  if (fence) errors.push(`${relative}: unclosed code fence`);
  if (!source.startsWith('# ')) errors.push(`${relative}: missing document title`);
}

const artifacts = JSON.parse(fs.readFileSync(path.join(root, 'model/artifact-index.json'), 'utf8'));
const promptTypes = ['START', 'CLARIFY', 'SELECT', 'GENERATE', 'REVIEW', 'REVISE', 'VERIFY', 'HANDOFF', 'FAILURE'];
if (artifacts.length !== 22 || new Set(artifacts.map((item) => item.id)).size !== 22) errors.push('Expected 22 unique artifact types');
for (const item of artifacts) {
  for (const type of ['spec', 'template', 'example']) {
    if (!fs.existsSync(path.join(root, item[type]))) errors.push(`${item.id}: missing ${type}`);
  }
  const spec = fs.readFileSync(path.join(root, item.spec), 'utf8');
  for (const type of promptTypes) if (!spec.includes(`[${item.id}-${type}]`)) errors.push(`${item.id}: missing ${type} prompt`);
  if (!spec.includes('## 必填内容与字段含义') || !spec.includes('## 质量标准与边界')) errors.push(`${item.id}: missing content or quality specification`);
  const example = fs.readFileSync(path.join(root, item.example), 'utf8');
  if (!example.includes('教学填写示例') || !example.includes('不作通过结论')) errors.push(`${item.id}: example lacks evidence boundary`);
}
const stages = ['requirements', 'design', 'implementation', 'verification', 'release', 'maintenance'];
for (const stage of stages) {
  const source = fs.readFileSync(path.join(root, `model/stages/${stage}.md`), 'utf8');
  for (const key of ['START', 'DECIDE', 'GENERATE', 'REVIEW', 'VERIFY', 'HANDOFF', 'RECOVER']) {
    if (!source.includes(`-${key}]`)) errors.push(`${stage}: missing ${key} prompt`);
  }
}
console.log(JSON.stringify({ files: files.length, localLinks: links, artifacts: artifacts.length, stages: stages.length, errors }, null, 2));
process.exitCode = errors.length ? 1 : 0;
