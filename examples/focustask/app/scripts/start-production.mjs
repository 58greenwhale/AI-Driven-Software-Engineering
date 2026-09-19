import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { appRoot, localConfig } from "./env.mjs";
const mode = process.argv[2] || "test";
const env = localConfig(mode);
const standalone = path.join(appRoot, ".next/standalone");
if (!fs.existsSync(path.join(standalone, "server.js")))
  throw new Error("Run a production build first");
fs.cpSync(
  path.join(appRoot, ".next/static"),
  path.join(standalone, ".next/static"),
  { recursive: true },
);
const child = spawn(process.execPath, [path.join(standalone, "server.js")], {
  cwd: standalone,
  env: {
    ...process.env,
    ...env,
    HOSTNAME: "127.0.0.1",
    PORT: new URL(env.APP_BASE_URL).port,
  },
  stdio: "inherit",
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
