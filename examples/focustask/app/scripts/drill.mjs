import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync, spawn } from 'node:child_process';
import { appRoot, runtime, localConfig, writePrivate } from './env.mjs';
const [action] = process.argv.slice(2);
const directory = path.join(runtime, 'permission-drill');
const evidence = path.resolve(appRoot, '../evidence/maintenance/permission');
const stateFile = path.join(runtime, 'drill-state.json');
const config = localConfig('drill');
const productFiles = ['src','prisma','package.json','package-lock.json','tsconfig.json','next-env.d.ts','next.config.mjs','eslint.config.mjs'];
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
function execute(executable,args,cwd=directory) {
  const result=spawnSync(executable,args,{cwd,env:{...process.env,...config},stdio:'inherit'});
  if(result.status!==0)throw new Error(`${path.basename(executable)} exit ${result.status}`);
}
function stop() {
  if(!fs.existsSync(stateFile)) return;
  const state=JSON.parse(fs.readFileSync(stateFile,'utf8'));
  const ps=spawnSync('ps',['-p',String(state.pid),'-o','command='],{encoding:'utf8'});
  if(ps.status!==0) return;
  const cwd=spawnSync('lsof',['-a','-p',String(state.pid),'-d','cwd','-Fn'],{encoding:'utf8'});
  if(!cwd.stdout.split('\n').includes(`n${state.directory}`))throw new Error('Drill PID ownership mismatch');
  process.kill(state.pid,'SIGTERM');
}
fs.mkdirSync(evidence,{recursive:true});
if(action==='prepare') {
  if(fs.existsSync(directory))throw new Error('Drill already prepared; preserve original evidence');
  fs.mkdirSync(directory,{recursive:true});
  for(const file of productFiles)fs.cpSync(path.join(appRoot,file),path.join(directory,file),{recursive:true});
  fs.symlinkSync(path.join(appRoot,'node_modules'),path.join(directory,'node_modules'),'dir');
  const source=path.join(directory,'src/server/tasks.ts');
  const original=fs.readFileSync(source,'utf8');
  const needle='if (member.role === "viewer")';
  if(!original.includes(needle))throw new Error('Expected permission guard missing');
  const defective=original.replace(needle,'if (member.role === "__injected_nonexistent_role__")');
  fs.writeFileSync(source,defective);
  fs.writeFileSync(path.join(evidence,'injection.json'),JSON.stringify({type:'deliberate-isolated-mutation',at:new Date().toISOString(),source:'src/server/tasks.ts',normalHash:hash(original),mutatedHash:hash(defective),change:'Replace viewer guard with unreachable role in isolated copy only',normalProduct:path.relative(appRoot,path.join(appRoot,'src/server/tasks.ts')),environment:'focustask_drill / 3213'},null,2)+'\n');
  console.log('Prepared isolated defective copy; normal source unchanged.');
} else if(action==='build') {
  execute(process.execPath,[path.join(appRoot,'node_modules/next/dist/bin/next'),'build']);
} else if(action==='start') {
  stop();
  const standalone=path.join(directory,'.next/standalone');
  // symlinked dependencies can cause tracing to preserve nested project paths.
  const findServer=dir=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.name==='node_modules'||e.name==='.next')continue;const full=path.join(dir,e.name);if(e.isFile()&&e.name==='server.js')return full;if(e.isDirectory()){const found=findServer(full);if(found)return found;}}};
  const server=findServer(standalone);if(!server)throw new Error('No standalone drill entry');
  const cwd=path.dirname(server);fs.cpSync(path.join(directory,'.next/static'),path.join(cwd,'.next/static'),{recursive:true});
  const occupied=spawnSync('lsof',['-nP','-iTCP:3213','-sTCP:LISTEN'],{encoding:'utf8'});if(occupied.status===0)throw new Error('Drill port occupied');
  const fd=fs.openSync(path.join(runtime,'drill.log'),'a',0o600);
  const child=spawn(process.execPath,[server],{cwd,env:{...process.env,...config,HOSTNAME:'127.0.0.1',PORT:'3213'},detached:true,stdio:['ignore',fd,fd]});child.unref();fs.closeSync(fd);
  writePrivate(stateFile,JSON.stringify({pid:child.pid,directory:cwd,sourceHash:hash(fs.readFileSync(path.join(directory,'src/server/tasks.ts')))},null,2));
  for(let i=0;i<30;i++){try{const r=await fetch(config.APP_BASE_URL+'/api/v1/health');if(r.ok){console.log('Drill candidate running on loopback3213, isolated database.');process.exit(0);}}catch{}await new Promise(r=>setTimeout(r,200));}throw new Error('Drill health failed');
} else if(action==='repair') {
  stop();
  const source=path.join(directory,'src/server/tasks.ts');const broken=fs.readFileSync(source,'utf8');
  if(!broken.includes('__injected_nonexistent_role__'))throw new Error('Expected mutation missing');
  const repaired=broken.replace('__injected_nonexistent_role__','viewer');fs.writeFileSync(source,repaired);
  fs.writeFileSync(path.join(evidence,'repair.json'),JSON.stringify({at:new Date().toISOString(),previousHash:hash(broken),repairedHash:hash(repaired),normalHash:hash(fs.readFileSync(path.join(appRoot,'src/server/tasks.ts'))),change:'Restore viewer role check; unchanged acceptance rule'},null,2)+'\n');
  console.log('Restored guard in drill copy; rebuild and independently recheck.');
} else if(action==='stop') {stop();console.log('Stopped only drill-owned process.');}
else throw new Error('prepare|build|start|repair|stop');
