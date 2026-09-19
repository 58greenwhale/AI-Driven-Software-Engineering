import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const example=path.join(root,'examples/focustask');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const failures=[];let hashes=0;
const inventory=fs.readFileSync(path.join(root,'execution/inventory.md'),'utf8');
for(const m of inventory.matchAll(/^\| ([^|]+) \| ([a-f0-9]{64}) \|$/gm)){
  hashes++;if(sha(fs.readFileSync(path.join(root,'execution/baseline',m[1])))!==m[2])failures.push(`Baseline changed: ${m[1]}`);
}
const currentVersion='v0.2.0-rc3';
for(const [file,digest]of JSON.parse(fs.readFileSync(path.join(example,`evidence/releases/${currentVersion}/source-files.json`),'utf8'))){hashes++;if(sha(fs.readFileSync(path.join(example,'app',file)))!==digest)failures.push(`Current product differs: ${file}`);}
for(const version of ['v0.1.0','v0.2.0','v0.2.0-rc2','v0.2.0-rc3','v0.2.0-bad']){
  const manifest=JSON.parse(fs.readFileSync(path.join(example,`evidence/releases/${version}/artifact.json`),'utf8'));
  for(const [file,digest]of manifest.files){hashes++;const p=path.join(example,`app/.runtime/releases/${version}`,file);if(!fs.existsSync(p)||sha(fs.readFileSync(p))!==digest)failures.push(`Artifact differs: ${version}/${file}`);}
  if(sha(JSON.stringify(manifest.files))!==manifest.artifactSha256)failures.push(`Invalid manifest summary: ${version}`);
}
for(const version of ['v0.1.0','v0.2.0','v0.2.0-rc2','v0.2.0-rc3']){
  const index=JSON.parse(fs.readFileSync(path.join(example,`evidence/screenshots/${version}/index.json`),'utf8'));
  for(const file of index.files){hashes++;if(sha(fs.readFileSync(path.join(example,`evidence/screenshots/${version}`,file.file)))!==file.sha256)failures.push(`Screenshot differs: ${version}/${file.file}`);}
}
const runs=fs.readdirSync(path.join(example,'evidence/runs')).filter(p=>p.endsWith('.json')).map(p=>JSON.parse(fs.readFileSync(path.join(example,'evidence/runs',p),'utf8')));
for(const run of runs){if(!fs.existsSync(path.join(example,'evidence/runs',run.log)))failures.push(`Missing log ${run.id}`);if(sha(JSON.stringify(run.files))!==run.sourceSha256)failures.push(`Invalid source hash ${run.id}`);}
const secretValues=[];
for(const mode of ['dev','test','release','drill']){
  const file=path.join(example,`app/.runtime/${mode}.json`);if(!fs.existsSync(file))continue;
  const config=JSON.parse(fs.readFileSync(file,'utf8'));
  for(const [key,value]of Object.entries(config))if(/SECRET|PASSWORD|DATABASE_URL/.test(key))secretValues.push(String(value));
  if(config.DATABASE_URL)secretValues.push(new URL(config.DATABASE_URL).password);
}
const excluded=new Set(['.git','node_modules','.next','.runtime','test-results','playwright-report']);let inspected=0;
function inspect(directory){for(const e of fs.readdirSync(directory,{withFileTypes:true})){if(excluded.has(e.name))continue;const p=path.join(directory,e.name);if(e.isDirectory())inspect(p);else if(e.isFile()&&/\.(md|json|log|ts|tsx|js|mjs|sql|toml|css)$/.test(p)){inspected++;const content=fs.readFileSync(p,'utf8');if(secretValues.some(s=>s&&content.includes(s)))failures.push(`Local secret present in ${path.relative(root,p)}`);}}}
inspect(root);
const results={hashesChecked:hashes,runRecords:runs.length,secretCheckedFiles:inspected,failures};console.log(JSON.stringify(results,null,2));process.exitCode=failures.length?1:0;
