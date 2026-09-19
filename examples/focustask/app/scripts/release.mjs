import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { appRoot, runtime, localConfig, writePrivate } from "./env.mjs";

const [action, version = "v0.1.0"] = process.argv.slice(2);
if (!/^v\d+\.\d+\.\d+(?:-[a-z0-9]+)?$/.test(version))
  throw new Error("Invalid local version");
const releases = path.join(runtime, "releases");
const directory = path.join(releases, version);
const stateFile = path.join(runtime, "release-state.json");
const evidence = path.resolve(appRoot, "../evidence/releases", version);
function digestTree(dir, base = dir) {
  const rows = [];
  for (const item of fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) rows.push(...digestTree(full, base));
    else if (item.isFile())
      rows.push([
        path.relative(base, full),
        crypto.createHash("sha256").update(fs.readFileSync(full)).digest("hex"),
      ]);
  }
  return rows;
}
function safeStop(state) {
  if (!state?.pid) return;
  if (!state.directory?.startsWith(releases + path.sep))
    throw new Error("Cannot stop process outside task release directory");
  const ps = spawnSync("ps", ["-p", String(state.pid), "-o", "command="], {
    encoding: "utf8",
  });
  if (ps.status !== 0) return;
  const cwd = spawnSync('lsof', ['-a', '-p', String(state.pid), '-d', 'cwd', '-Fn'], { encoding: 'utf8' });
  const matchesCwd = cwd.status === 0 && cwd.stdout.split('\n').includes(`n${state.directory}`);
  if (!ps.stdout.includes(path.join(state.directory, "server.js")) && !(matchesCwd && ps.stdout.includes('next-server')))
    throw new Error("PID ownership mismatch; refusing to stop");
  process.kill(state.pid, "SIGTERM");
}
async function healthy(url) {
  try {
    const response = await fetch(`${url}/api/v1/health`, {
      signal: AbortSignal.timeout(1500),
    });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}
fs.mkdirSync(releases, { recursive: true });
if (action === "pack") {
  if (fs.existsSync(directory))
    throw new Error(
      "Version already packaged; use a new candidate label rather than overwrite",
    );
  const source = path.join(appRoot, ".next/standalone");
  if (!fs.existsSync(path.join(source, "server.js")))
    throw new Error("Production build required");
  fs.cpSync(source, directory, { recursive: true });
  fs.cpSync(
    path.join(appRoot, ".next/static"),
    path.join(directory, ".next/static"),
    { recursive: true },
  );
  fs.mkdirSync(evidence, { recursive: true });
  const files = digestTree(directory);
  const manifest = {
    version,
    packagedAt: new Date().toISOString(),
    directory: path.relative(appRoot, directory),
    artifactSha256: crypto
      .createHash("sha256")
      .update(JSON.stringify(files))
      .digest("hex"),
    buildId: fs
      .readFileSync(path.join(directory, ".next/BUILD_ID"), "utf8")
      .trim(),
    files,
  };
  fs.writeFileSync(
    path.join(evidence, "artifact.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  console.log(`Packaged ${version}; artifact ${manifest.artifactSha256}`);
} else if (action === "start") {
  const env = localConfig("release");
  if (!fs.existsSync(path.join(directory, "server.js")))
    throw new Error("Packaged artifact missing");
  const manifest = JSON.parse(fs.readFileSync(path.join(evidence, 'artifact.json'), 'utf8'));
  const currentHash = crypto.createHash('sha256').update(JSON.stringify(digestTree(directory))).digest('hex');
  if (currentHash !== manifest.artifactSha256) throw new Error('Packaged artifact changed; do not launch an unverified version');
  const previous = fs.existsSync(stateFile)
    ? JSON.parse(fs.readFileSync(stateFile, "utf8"))
    : null;
  if (previous) safeStop(previous);
  // Wait for this task's previous process to release its port, without killing any unrelated process.
  for (let i = 0; previous && i < 20 && (await healthy(env.APP_BASE_URL)); i++)
    await new Promise((resolve) => setTimeout(resolve, 100));
  const port = new URL(env.APP_BASE_URL).port;
  const occupied = spawnSync("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN"], {
    encoding: "utf8",
  });
  if (occupied.status === 0 && occupied.stdout.trim())
    throw new Error(
      "Local release port is occupied; refusing to replace another process",
    );
  const logFile = path.join(runtime, `${version}-release.log`);
  const log = fs.openSync(logFile, "a", 0o600);
  const child = spawn(process.execPath, [path.join(directory, "server.js")], {
    cwd: directory,
    env: { ...process.env, ...env, HOSTNAME: "127.0.0.1", PORT: port },
    detached: true,
    stdio: ["ignore", log, log],
  });
  child.unref();
  fs.closeSync(log);
  const state = {
    version,
    directory,
    pid: child.pid,
    startedAt: new Date().toISOString(),
    previousVersion: previous?.version ?? null,
    url: env.APP_BASE_URL,
  };
  writePrivate(stateFile, JSON.stringify(state, null, 2));
  let health;
  for (let i = 0; i < 25; i++) {
    health = await healthy(env.APP_BASE_URL);
    if (health) break;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  fs.mkdirSync(evidence, { recursive: true });
  fs.writeFileSync(
    path.join(evidence, `start-${Date.now()}.json`),
    JSON.stringify(
      { ...state, health: health ?? null, result: health ? "通过" : "失败" },
      null,
      2,
    ) + "\n",
  );
  if (!health)
    throw new Error(
      "Release health failed; use previous packaged version to recover",
    );
  console.log(
    `Running ${version} on ${env.APP_BASE_URL}; health checked. Core data smoke tests remain required.`,
  );
} else if (action === "stop") {
  const state = fs.existsSync(stateFile)
    ? JSON.parse(fs.readFileSync(stateFile, "utf8"))
    : null;
  safeStop(state);
  console.log(
    "Stopped task-owned release process, if it was running. Database preserved.",
  );
} else
  throw new Error("Usage: node scripts/release.mjs pack|start|stop version");
