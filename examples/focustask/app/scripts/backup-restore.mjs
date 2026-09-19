import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { appRoot,runtime,localConfig,pgBin } from './env.mjs';
const env=localConfig('release');const url=new URL(env.DATABASE_URL);
if(url.hostname!=='127.0.0.1'||url.pathname!=='/focustask_release')throw new Error('Dedicated release database required');
const name=`focustask_restore_${Date.now()}`;
const backup=path.join(runtime,`backup-${Date.now()}.dump`);
const credentials={...process.env,PGPASSWORD:decodeURIComponent(url.password)};
const common=['-h',url.hostname,'-p',url.port,'-U',decodeURIComponent(url.username)];
function run(tool,args){const r=spawnSync(path.join(pgBin,tool),args,{env:credentials,encoding:'utf8'});if(r.status!==0)throw new Error(`${tool} exit ${r.status}`);return r.stdout;}
const source=run('psql',[...common,'-d','focustask_release','-Atc','SELECT id FROM tasks ORDER BY id']);
run('pg_dump',[...common,'-d','focustask_release','-Fc','-f',backup]);fs.chmodSync(backup,0o600);
let created=false;
try {
  run('createdb',[...common,name]);created=true;
  run('pg_restore',[...common,'-d',name,'--no-owner',backup]);
  const restored=run('psql',[...common,'-d',name,'-Atc','SELECT id FROM tasks ORDER BY id']);assert.equal(restored,source);
  const result={at:new Date().toISOString(),source:'focustask_release',restoreDatabase:name,backup:path.relative(appRoot,backup),taskCount:source.trim().split('\n').filter(Boolean).length,identicalTaskIds:true,result:'通过',scope:'One actual local backup/restore; no claim about 30-day retention or quarterly schedule.'};
  fs.writeFileSync(path.resolve(appRoot,'../evidence/backup-restore.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
} finally {if(created)run('dropdb',[...common,name]);}
