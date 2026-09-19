import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { appRoot } from './env.mjs';
const version = process.argv[2];
if (!/^v\d+\.\d+\.\d+(?:-[a-z0-9]+)?$/.test(version ?? '')) throw new Error('Invalid version');
const rows = [];
function walk(relative) {
  const file=path.join(appRoot,relative);
  if(fs.statSync(file).isDirectory()) for(const entry of fs.readdirSync(file).sort()) walk(path.join(relative,entry));
  else rows.push([relative,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]);
}
['src','prisma','package.json','package-lock.json','next.config.mjs'].forEach(walk);
const destination=path.resolve(appRoot,'../evidence/releases',version,'source-files.json');
fs.mkdirSync(path.dirname(destination),{recursive:true});
if(fs.existsSync(destination) && JSON.stringify(JSON.parse(fs.readFileSync(destination,'utf8')))!==JSON.stringify(rows)) throw new Error('Do not overwrite a different source snapshot');
fs.writeFileSync(destination,JSON.stringify(rows,null,2)+'\n');
console.log(`${version} product source: ${crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex')}`);
