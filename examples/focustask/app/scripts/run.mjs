import { spawn } from "node:child_process";
import { localConfig, appRoot } from "./env.mjs";
const [mode, executable, ...args] = process.argv.slice(2);
if (!executable)
  throw new Error("Usage: node scripts/run.mjs mode executable [args]");
const child = spawn(executable, args, {
  cwd: appRoot,
  env: { ...process.env, ...localConfig(mode) },
  stdio: "inherit",
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
