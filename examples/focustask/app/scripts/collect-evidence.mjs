import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { appRoot, runtime } from './env.mjs';
const version = process.argv[2];
if (!/^v\d+\.\d+\.\d+(?:-[a-z0-9]+)?$/.test(version ?? '')) throw new Error('Provide an evidence version');
const source = path.join(runtime, 'screenshots');
const target = path.resolve(appRoot, '../evidence/screenshots', version);
fs.mkdirSync(target, { recursive: true });
const files = [];
for (const name of fs.readdirSync(source).sort()) {
  if (!/^(chromium|firefox|webkit)-\d+-[a-z-]+\.png$/.test(name)) continue;
  const bytes = fs.readFileSync(path.join(source, name));
  const destination = path.join(target, name);
  if (fs.existsSync(destination) && !fs.readFileSync(destination).equals(bytes)) throw new Error(`Refuse to replace archived evidence ${name}`);
  fs.writeFileSync(destination, bytes);
  files.push({ file: name, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
}
fs.writeFileSync(path.join(target, 'index.json'), JSON.stringify({ version, collectedAt: new Date().toISOString(), description: 'Actual browser state screenshots; not by themselves proof of backend/data requirements.', files }, null, 2) + '\n');
console.log(`Archived ${files.length} actual screenshots for ${version}`);
