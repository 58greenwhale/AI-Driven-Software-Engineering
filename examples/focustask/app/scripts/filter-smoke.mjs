import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { appRoot,localConfig } from './env.mjs';
const env=localConfig('release');const base=env.APP_BASE_URL;
const login=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({email:'viewer@example.test',password:env.FOCUSTASK_SEED_PASSWORD})});assert.equal(login.status,200);
const cookie=login.headers.get('set-cookie').split(';')[0];const rows=[];
for(const status of ['todo','in_progress','done']){
  const response=await fetch(`${base}/api/v1/projects/20000000-0000-4000-8000-000000000001/tasks?status=${status}`,{headers:{Cookie:cookie}});assert.equal(response.status,200);const body=await response.json();assert(body.data.tasks.every(t=>t.status===status));assert.equal(body.data.total,body.data.tasks.length);rows.push({status,total:body.data.total});
}
const invalid=await fetch(base+'/api/v1/projects/20000000-0000-4000-8000-000000000001/tasks?status=invalid',{headers:{Cookie:cookie}});assert.equal(invalid.status,400);
const result={at:new Date().toISOString(),target:base,role:'viewer',states:rows,invalidStatus:invalid.status,result:'通过'};
fs.writeFileSync(path.resolve(appRoot,'../evidence/releases/v0.2.0-rc2/filter-smoke.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
