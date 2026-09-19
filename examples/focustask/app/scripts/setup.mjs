import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  execute,
  generateSecrets,
  pgBin,
  runtime,
  writePrivate,
} from "./env.mjs";

const mode = process.argv[2] || "dev";
if (!["dev", "test", "release", "drill"].includes(mode))
  throw new Error("Invalid environment");
const { cluster, config } = generateSecrets(mode);
const data = path.join(runtime, "postgres");
const passwordFile = path.join(runtime, "pg-password");
writePrivate(passwordFile, cluster.password);
if (!fs.existsSync(path.join(data, "PG_VERSION"))) {
  const portCheck = spawnSync(
    path.join(pgBin, "pg_isready"),
    ["-h", "127.0.0.1", "-p", String(cluster.port)],
    { stdio: "ignore" },
  );
  if (portCheck.status === 0)
    throw new Error(
      "Dedicated port already occupied; do not touch existing service",
    );
  execute(path.join(pgBin, "initdb"), [
    "-D",
    data,
    "-U",
    "focustask",
    "--pwfile",
    passwordFile,
    "--auth=scram-sha-256",
    "--encoding=UTF8",
    "--locale=C",
  ]);
}
const status = spawnSync(path.join(pgBin, "pg_ctl"), ["-D", data, "status"], {
  stdio: "ignore",
});
if (status.status !== 0) {
  execute(path.join(pgBin, "pg_ctl"), [
    "-D",
    data,
    "-l",
    path.join(runtime, "postgres.log"),
    "-o",
    `-h 127.0.0.1 -p ${cluster.port} -c unix_socket_directories='' -c statement_timeout=8000`,
    "-w",
    "start",
  ]);
}
const common = [
  "-h",
  "127.0.0.1",
  "-p",
  String(cluster.port),
  "-U",
  "focustask",
];
const exists = spawnSync(
  path.join(pgBin, "psql"),
  [
    ...common,
    "-d",
    "postgres",
    "-Atc",
    `SELECT 1 FROM pg_database WHERE datname='focustask_${mode}'`,
  ],
  { env: { ...process.env, PGPASSWORD: cluster.password }, encoding: "utf8" },
);
if (exists.status !== 0) throw new Error("Dedicated database query failed");
if (exists.stdout.trim() !== "1")
  execute(path.join(pgBin, "createdb"), [...common, `focustask_${mode}`], {
    PGPASSWORD: cluster.password,
  });
execute("node_modules/.bin/prisma", ["generate"], config);
execute("node_modules/.bin/prisma", ["migrate", "deploy"], config);
execute("node_modules/.bin/tsx", ["prisma/seed.ts"], config);
console.log(
  `Ready: ${mode}; configuration in ignored .runtime/${mode}.json (credentials not printed).`,
);
