import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const options = { cli: 'mmdc' };
for (let i = 0; i < args.length; i += 2) {
  if (!['--cli', '--puppeteer-config'].includes(args[i]) || !args[i + 1]) {
    throw new Error('Usage: node scripts/render-model-diagrams.mjs [--cli /path/to/mmdc] [--puppeteer-config /path/to/config.json]');
  }
  options[args[i].slice(2)] = args[i + 1];
}
const directory = path.join(root, 'model/diagrams');
const names = ['lifecycle', 'collaboration', 'artifacts', 'organization'];
const missing = names.filter((name) => !fs.existsSync(path.join(directory, `${name}.mmd`)));
if (missing.length) {
  console.error(`缺少图解源码：${missing.map((name) => `${name}.mmd`).join(', ')}`);
  process.exit(1);
}
for (const name of names) {
  for (const format of ['svg', 'png']) {
    const output = path.join(directory, `${name}.${format}`);
    const parameters = [
      '-i', path.join(directory, `${name}.mmd`), '-o', output,
      '-c', path.join(directory, 'mermaid-config.json'),
      '-I', `ai-lifecycle-${name}`,
      '-b', 'white', '-w', '1800', '-H', '1200', '-s', '2',
    ];
    if (options['puppeteer-config']) parameters.push('-p', options['puppeteer-config']);
    execFileSync(options.cli, parameters, { cwd: root, stdio: 'inherit' });
    if (fs.statSync(output).size === 0) throw new Error(`Empty diagram: ${output}`);
    console.log(`Rendered ${path.relative(root, output)}`);
  }
}
