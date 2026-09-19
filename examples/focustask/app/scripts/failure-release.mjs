import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { appRoot,runtime } from './env.mjs';
const sourceVersion=process.argv[2]||'v0.2.0-rc2';
const badVersion='v0.2.0-bad';
if(!/^v\d+\.\d+\.\d+(?:-[a-z0-9]+)?$/.test(sourceVersion))throw new Error('Invalid source version');
const source=path.join(runtime,'releases',sourceVersion);const target=path.join(runtime,'releases',badVersion);
if(fs.existsSync(target))throw new Error('Failure rehearsal artifact already exists');
if(!fs.existsSync(path.join(source,'server.js')))throw new Error('Verified source artifact required');
fs.cpSync(source,target,{recursive:true});
const before=fs.readFileSync(path.join(target,'server.js'));
const code=`// Deliberate isolated failure rehearsal, never the normal application entry.\nconst http=require('node:http');\nhttp.createServer((_req,res)=>{res.writeHead(503,{'Content-Type':'application/json'});res.end(JSON.stringify({error:{code:'REHEARSAL_FAILURE',message:'deliberate local exercise'}}));}).listen(Number(process.env.PORT),'127.0.0.1');\n`;
fs.writeFileSync(path.join(target,'server.js'),code);
function tree(dir,base=dir){const result=[];for(const e of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const full=path.join(dir,e.name);if(e.isDirectory())result.push(...tree(full,base));else if(e.isFile())result.push([path.relative(base,full),crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex')]);}return result;}
const files=tree(target);const evidence=path.resolve(appRoot,'../evidence/releases',badVersion);fs.mkdirSync(evidence,{recursive:true});
fs.writeFileSync(path.join(evidence,'artifact.json'),JSON.stringify({version:badVersion,sourceVersion,kind:'deliberate unhealthy deployment exercise',packagedAt:new Date().toISOString(),originalServerSha256:crypto.createHash('sha256').update(before).digest('hex'),artifactSha256:crypto.createHash('sha256').update(JSON.stringify(files)).digest('hex'),files},null,2)+'\n');
console.log('Created isolated unhealthy artifact. Normal build and databases untouched.');
