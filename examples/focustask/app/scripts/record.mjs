import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { appRoot, runtime } from "./env.mjs";

const [label, executable, ...args] = process.argv.slice(2);
if (!label || !/^[a-zA-Z0-9_.-]+$/.test(label) || !executable)
  throw new Error("Usage: node scripts/record.mjs label executable args");
const excluded = new Set([
  "node_modules",
  ".runtime",
  ".next",
  "test-results",
  "playwright-report",
  ".git",
]);
function tree(dir, base = dir) {
  const entries = [];
  for (const entry of fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))) {
    if (
      excluded.has(entry.name) ||
      entry.name.endsWith(".tsbuildinfo") ||
      (entry.name.startsWith(".env") && entry.name !== ".env.example")
    )
      continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) entries.push(...tree(full, base));
    else if (entry.isFile())
      entries.push({
        file: path.relative(base, full),
        sha256: crypto
          .createHash("sha256")
          .update(fs.readFileSync(full))
          .digest("hex"),
      });
  }
  return entries;
}
const evidence = path.resolve(appRoot, "../evidence/runs");
fs.mkdirSync(evidence, { recursive: true });
const id = `${new Date().toISOString().replace(/[:.]/g, "-")}-${label}`;
const files = tree(appRoot);
const specs = tree(path.resolve(appRoot, "../docs"));
const secretValues = [];
for (const mode of ["dev", "test", "release", "drill"]) {
  const file = path.join(runtime, `${mode}.json`);
  if (fs.existsSync(file)) {
    const env = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const [key, value] of Object.entries(env))
      if (/SECRET|PASSWORD|DATABASE_URL/.test(key))
        secretValues.push(String(value));
    if (env.DATABASE_URL) secretValues.push(new URL(env.DATABASE_URL).password);
  }
}
const redact = (text) =>
  secretValues
    .reduce(
      (s, secret) => (secret ? s.replaceAll(secret, "[REDACTED]") : s),
      text,
    )
    .replace(/\u001b\[[0-9;]*m/g, "");
const start = new Date();
let output = "";
const child = spawn(executable, args, {
  cwd: appRoot,
  env: process.env,
  stdio: ["inherit", "pipe", "pipe"],
});
for (const stream of [child.stdout, child.stderr])
  stream.on("data", (data) => {
    output += data.toString();
  });
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("error", (error) => {
  output += error.message;
});
child.on("close", (code) => {
  const end = new Date();
  const result = {
    id,
    label,
    command: [executable, ...args],
    workingDirectory: "examples/focustask/app",
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    startedAt: start.toISOString(),
    endedAt: end.toISOString(),
    durationMs: end - start,
    exitCode: code ?? 1,
    sourceSha256: crypto
      .createHash("sha256")
      .update(JSON.stringify(files))
      .digest("hex"),
    files,
    specs,
    log: `${id}.log`,
  };
  fs.writeFileSync(path.join(evidence, `${id}.log`), redact(output));
  fs.writeFileSync(
    path.join(evidence, `${id}.json`),
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(redact(output));
  console.log(`Evidence: ../evidence/runs/${id}.json`);
  process.exitCode = code ?? 1;
});
