import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

export const appRoot = path.resolve(import.meta.dirname, "..");
export const runtime = path.join(appRoot, ".runtime");
export const pgBin =
  process.env.FOCUSTASK_PG_BIN || "/opt/homebrew/opt/postgresql@18/bin";
export function localConfig(mode) {
  if (!["dev", "test", "release", "drill"].includes(mode))
    throw new Error("Invalid environment");
  const file = path.join(runtime, `${mode}.json`);
  if (!fs.existsSync(file))
    throw new Error(`Run node scripts/setup.mjs ${mode} first`);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
export function execute(command, args, env = {}) {
  const result = spawnSync(command, args, {
    cwd: appRoot,
    env: { ...process.env, ...env },
    stdio: "inherit",
  });
  if (result.status !== 0)
    throw new Error(`${path.basename(command)} failed (exit ${result.status})`);
}
export function writePrivate(file, data) {
  fs.writeFileSync(file, data, { mode: 0o600 });
  fs.chmodSync(file, 0o600);
}
export function generateSecrets(mode) {
  fs.mkdirSync(runtime, { recursive: true, mode: 0o700 });
  const clusterFile = path.join(runtime, "cluster.json");
  if (!fs.existsSync(clusterFile))
    writePrivate(
      clusterFile,
      JSON.stringify({
        port: 55461,
        password: crypto.randomBytes(32).toString("hex"),
      }),
    );
  const cluster = JSON.parse(fs.readFileSync(clusterFile, "utf8"));
  const file = path.join(runtime, `${mode}.json`);
  if (!fs.existsSync(file)) {
    const ports = { dev: 3210, test: 3211, release: 3212, drill: 3213 };
    writePrivate(
      file,
      JSON.stringify(
        {
          DATABASE_URL: `postgresql://focustask:${cluster.password}@127.0.0.1:${cluster.port}/focustask_${mode}?schema=public&connection_limit=5&connect_timeout=5&socket_timeout=8`,
          SESSION_SECRET: crypto.randomBytes(32).toString("hex"),
          APP_BASE_URL: `http://127.0.0.1:${ports[mode]}`,
          LOG_LEVEL: "info",
          FOCUSTASK_ENV: mode,
          FOCUSTASK_SEED_PASSWORD: crypto.randomBytes(24).toString("base64url"),
        },
        null,
        2,
      ),
    );
  }
  return { cluster, config: localConfig(mode) };
}
