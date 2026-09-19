import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const checker = fileURLToPath(new URL('./check-docs.mjs', import.meta.url));
const renderer = fileURLToPath(new URL('./render-model-diagrams.mjs', import.meta.url));
const artifactPrompts = ['START', 'CLARIFY', 'SELECT', 'GENERATE', 'REVIEW', 'REVISE', 'VERIFY', 'HANDOFF', 'FAILURE'];
const stagePrompts = ['START', 'DECIDE', 'GENERATE', 'REVIEW', 'VERIFY', 'HANDOFF', 'RECOVER'];

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lifecycle-doc-check-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (relative, content) => {
    const file = path.join(root, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  };
  const index = Array.from({ length: 22 }, (_, i) => {
    const id = `A${String(i + 1).padStart(2, '0')}`;
    const item = { id, title: id, spec: `model/artifacts/${id}.md`, template: `templates/${id}.md`, example: `examples/${id}.md` };
    write(item.spec, `# ${id}\n\n## 必填内容与字段含义\n\n## 质量标准与边界\n\n${artifactPrompts.map((key) => `[${id}-${key}]`).join('\n')}\n`);
    write(item.template, `# ${id} Template\n`);
    write(item.example, `# ${id} Example\n\n教学填写示例，不作通过结论。\n`);
    return item;
  });
  write('model/artifact-index.json', JSON.stringify(index));
  for (const [name, prefix] of Object.entries({ verification: 'VAL', release: 'REL', maintenance: 'MAINT' })) {
    write(`model/stages/${name}.md`, `# ${name}\n\n${stagePrompts.map((key) => `[${prefix}-${key}]`).join('\n')}\n`);
  }
  write('README.md', '# Fixture\n\n[Specification](model/artifacts/A01.md#必填内容与字段含义)\n');
  const replace = (relative, before, after) => write(relative, fs.readFileSync(path.join(root, relative), 'utf8').replace(before, after));
  return { root, write, replace, index };
}

function run(root) {
  const result = spawnSync(process.execPath, [checker, '--root', root], { encoding: 'utf8', cwd: os.tmpdir() });
  assert.equal(result.signal, null);
  assert.equal(result.stderr, '');
  return { code: result.status, report: JSON.parse(result.stdout) };
}

test('complete artifact set and three lifecycle guides pass', (t) => {
  const f = fixture(t);
  const { code, report } = run(f.root);
  assert.equal(code, 0);
  assert.deepEqual(report.errors, []);
  assert.equal(report.artifacts, 22);
  assert.equal(report.stages, 3);
  assert.equal(report.localLinks, 1);
});

const cases = [
  ['missing spec', (f) => fs.unlinkSync(path.join(f.root, 'model/artifacts/A01.md')), /A01: spec.*missing or unreadable/],
  ['missing template', (f) => fs.unlinkSync(path.join(f.root, 'templates/A01.md')), /A01: template.*missing or unreadable/],
  ['missing example', (f) => fs.unlinkSync(path.join(f.root, 'examples/A01.md')), /A01: example.*missing or unreadable/],
  ['duplicate ID', (f) => { f.index[1].id = 'A01'; f.write('model/artifact-index.json', JSON.stringify(f.index)); }, /Expected 22 unique/],
  ['missing indexed type', (f) => f.write('model/artifact-index.json', JSON.stringify(f.index.slice(1))), /Expected 22 unique/],
  ['unexpected ID', (f) => { f.index[21].id = 'A99'; f.write('model/artifact-index.json', JSON.stringify(f.index)); }, /Expected 22 unique/],
  ['malformed JSON', (f) => f.write('model/artifact-index.json', '{'), /expected a JSON array/],
  ['wrong index shape', (f) => f.write('model/artifact-index.json', '{}'), /expected a JSON array/],
  ['invalid entry', (f) => { f.index[0] = null; f.write('model/artifact-index.json', JSON.stringify(f.index)); }, /Invalid artifact entry/],
  ['missing path', (f) => { delete f.index[0].spec; f.write('model/artifact-index.json', JSON.stringify(f.index)); }, /missing spec path/],
  ['missing artifact prompt', (f) => f.replace('model/artifacts/A01.md', '[A01-VERIFY]', ''), /A01: missing VERIFY prompt/],
  ['missing required chapter', (f) => f.replace('model/artifacts/A01.md', '## 必填内容与字段含义', '## Other'), /missing content or quality/],
  ['missing teaching label', (f) => f.replace('examples/A01.md', '教学填写示例', ''), /lacks evidence boundary/],
  ['missing non-evidence warning', (f) => f.replace('examples/A01.md', '不作通过结论', ''), /lacks evidence boundary/],
  ['missing guide', (f) => fs.unlinkSync(path.join(f.root, 'model/stages/release.md')), /stages\/release.md: missing/],
  ['missing stage prompt', (f) => f.replace('model/stages/release.md', '[REL-START]', ''), /release: missing START prompt/],
  ['wrong stage prefix', (f) => f.replace('model/stages/release.md', '[REL-START]', '[VAL-START]'), /release: missing START prompt/],
  ['broken link', (f) => f.write('README.md', '# Fixture\n\n[Missing](absent.md)\n'), /missing link target/],
  ['broken anchor', (f) => f.write('README.md', '# Fixture\n\n[Missing](model/artifacts/A01.md#absent)\n'), /missing anchor/],
  ['invalid URL encoding', (f) => f.write('README.md', '# Fixture\n\n[Bad](%XX.md)\n'), /invalid link encoding/],
  ['missing title', (f) => f.write('README.md', 'No title\n'), /missing document title/],
  ['unclosed fence', (f) => f.write('README.md', '# Fixture\n\n```text\nunclosed\n'), /unclosed code fence/],
  ['trailing whitespace', (f) => f.write('README.md', '# Fixture  \n'), /trailing whitespace/],
];

for (const [name, change, expected] of cases) {
  test(`rejects ${name} with a diagnostic`, (t) => {
    const f = fixture(t);
    change(f);
    const { code, report } = run(f.root);
    assert.equal(code, 1);
    assert.match(report.errors.join('\n'), expected);
  });
}

test('collects independent errors after a missing artifact', (t) => {
  const f = fixture(t);
  fs.unlinkSync(path.join(f.root, 'model/artifacts/A01.md'));
  f.replace('examples/A02.md', '不作通过结论', '');
  const { code, report } = run(f.root);
  assert.equal(code, 1);
  assert.match(report.errors.join('\n'), /A01: spec/);
  assert.match(report.errors.join('\n'), /A02: example lacks/);
});

test('missing root and index produce diagnostics, not uncaught exceptions', (t) => {
  const f = fixture(t);
  const { code, report } = run(path.join(f.root, 'not-created'));
  assert.equal(code, 1);
  assert.match(report.errors.join('\n'), /missing or unreadable directory/);
  assert.match(report.errors.join('\n'), /artifact-index.json/);
});

test('invalid CLI arguments return usage failure', () => {
  const result = spawnSync(process.execPath, [checker, '--root'], { encoding: 'utf8' });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Usage:/);
});

test('renderer rejects missing sources before invoking an external tool', () => {
  const result = spawnSync(process.execPath, [renderer, '--cli', '/nonexistent/test-mmdc'], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /缺少图解源码/);
  assert.match(result.stderr, /organization.mmd/);
  assert.doesNotMatch(result.stderr, /ENOENT|spawnSync/);
  assert.equal(result.stdout, '');
});
