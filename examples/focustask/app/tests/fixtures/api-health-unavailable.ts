import { randomBytes } from "node:crypto";
import { createServer } from "node:net";
import { performance } from "node:perf_hooks";

const reservation = createServer();
await new Promise<void>((resolve, reject) => {
  reservation.once("error", reject);
  reservation.listen(0, "127.0.0.1", resolve);
});
const address = reservation.address();
if (!address || typeof address === "string")
  throw new Error("Expected a loopback TCP port");
await new Promise<void>((resolve, reject) => {
  reservation.close((error) => (error ? reject(error) : resolve()));
});

// This child receives fictional configuration and never connects to the shared database.
process.env.DATABASE_URL =
  `postgresql://api07:fictional-password@127.0.0.1:${address.port}/api07_unavailable` +
  "?schema=public&connection_limit=1&connect_timeout=1&socket_timeout=1";
process.env.SESSION_SECRET = randomBytes(32).toString("hex");
process.env.APP_BASE_URL = "http://127.0.0.1:3211";

const { handle } = await import("../../src/server/api");
const { db } = await import("../../src/server/db");
const results = [];
try {
  for (const route of ["health", "auth/login"]) {
    const request = new Request(`${process.env.APP_BASE_URL}/api/v1/${route}`, {
      ...(route === "auth/login"
        ? {
            method: "POST",
            headers: {
              "content-type": "application/json",
              origin: process.env.APP_BASE_URL,
            },
            body: JSON.stringify({
              email: "outage@example.test",
              password: "fictional-login-password",
            }),
          }
        : {}),
    });
    const started = performance.now();
    const response = await handle(request, route.split("/"));
    results.push({
      route,
      status: response.status,
      durationMs: performance.now() - started,
      requestId: response.headers.get("x-request-id"),
      cacheControl: response.headers.get("cache-control"),
      body: await response.json(),
    });
  }
} finally {
  await db.$disconnect();
}
console.log(`API07_RESULT ${JSON.stringify(results)}`);
