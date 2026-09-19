import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { appRoot } from './env.mjs';
// A fake PostgreSQL peer accepts TCP but never replies. No shared database or normal server is stopped.
const sockets=new Set();
const stalled=net.createServer(socket=>{sockets.add(socket);socket.on('close',()=>sockets.delete(socket));});
await new Promise((resolve,reject)=>{stalled.once('error',reject);stalled.listen(0,'127.0.0.1',resolve);});
const pgPort=stalled.address().port;
const reservation=net.createServer();await new Promise(r=>reservation.listen(0,'127.0.0.1',r));const port=reservation.address().port;await new Promise(r=>reservation.close(r));
const artifact=path.join(appRoot,'.next/standalone');
const secret=crypto.randomBytes(32).toString('hex');
const child=spawn(process.execPath,[path.join(artifact,'server.js')],{cwd:artifact,env:{...process.env,PORT:String(port),HOSTNAME:'127.0.0.1',DATABASE_URL:`postgresql://fixture:unusable@127.0.0.1:${pgPort}/not_a_real_database?connect_timeout=5&socket_timeout=8&connection_limit=1`,APP_BASE_URL:`http://127.0.0.1:${port}`,SESSION_SECRET:secret},stdio:['ignore','pipe','pipe']});
let serverLog='';child.stdout.on('data',c=>serverLog+=c);child.stderr.on('data',c=>serverLog+=c);
const results=[];
try {
  let ready=false;for(let i=0;i<40;i++){try{const r=await fetch(`http://127.0.0.1:${port}/login`,{signal:AbortSignal.timeout(1000)});if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}assert(ready,'Fault probe process must start');
  for(const endpoint of ['health','auth/login']) {
    const started=performance.now();
    const response=await fetch(`http://127.0.0.1:${port}/api/v1/${endpoint}`,{...(endpoint==='auth/login'?{method:'POST',headers:{Origin:`http://127.0.0.1:${port}`,'Content-Type':'application/json'},body:JSON.stringify({email:'fault@example.test',password:'fictional-unusable-input'})}:{}),signal:AbortSignal.timeout(12000)});
    const body=await response.json();const durationMs=performance.now()-started;
    assert.equal(response.status,503);assert(durationMs<=10000);assert(['UNAVAILABLE','TIMEOUT'].includes(body.error.code));
    assert(!JSON.stringify(body).includes('postgresql'));assert(!JSON.stringify(body).includes(secret));
    results.push({endpoint,status:response.status,durationMs,body});
  }
  assert(!serverLog.includes(secret));assert(!serverLog.includes('fictional-unusable-input'));
  const output={at:new Date().toISOString(),kind:'real HTTP and stalled loopback database peer',result:'通过',results,scope:'Actual Next HTTP process and stalled TCP handshake; not arbitrary CPU-bound event-loop blocking or proof of transaction cancellation.'};
  fs.writeFileSync(path.resolve(appRoot,'../evidence/http-fault.json'),JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify(output));
} finally {
  if(child.exitCode===null){child.kill('SIGTERM');await new Promise(r=>{child.once('exit',r);setTimeout(()=>{if(child.exitCode===null)child.kill('SIGKILL');r();},3000).unref();});}
  for(const socket of sockets)socket.destroy();await new Promise(r=>stalled.close(r));
}
