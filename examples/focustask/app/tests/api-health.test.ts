import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { handle } from "../src/server/api";
import { db } from "../src/server/db";

const genericMessage =
  "\u670d\u52a1\u6682\u4e0d\u53ef\u7528\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5";
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("API-07 database failure and response deadline", () => {
  it("returns generic 503 within ten seconds for real refused database connections", async () => {
    const fixture = fileURLToPath(
      new URL("./fixtures/api-health-unavailable.ts", import.meta.url),
    );
    const output = await new Promise<{
      code: number | null;
      stdout: string;
      stderr: string;
      timedOut: boolean;
    }>((resolve, reject) => {
      const child = spawn(process.execPath, ["--import", "tsx", fixture], {
        cwd: process.cwd(),
        env: { PATH: process.env.PATH, NODE_ENV: "test" },
        stdio: ["ignore", "pipe", "pipe"],
      });
      let stdout = "";
      let stderr = "";
      let timedOut = false;
      const watchdog = setTimeout(() => {
        timedOut = true;
        child.kill("SIGKILL");
      }, 25000);
      child.stdout.on("data", (chunk) => (stdout += chunk.toString()));
      child.stderr.on("data", (chunk) => (stderr += chunk.toString()));
      child.once("error", (error) => {
        clearTimeout(watchdog);
        reject(error);
      });
      child.once("close", (code) => {
        clearTimeout(watchdog);
        resolve({ code, stdout, stderr, timedOut });
      });
    });
    expect(
      output,
      "The isolated real-connection probe must finish",
    ).toMatchObject({
      code: 0,
      stderr: "",
      timedOut: false,
    });
    const lines = output.stdout.trim().split("\n");
    const marker = lines.find((line) => line.startsWith("API07_RESULT "));
    expect(marker).toBeDefined();
    const results = JSON.parse(marker!.slice("API07_RESULT ".length));
    expect(results).toHaveLength(2);
    expect(results.map((result: { route: string }) => result.route)).toEqual([
      "health",
      "auth/login",
    ]);
    for (const result of results) {
      expect(result.status).toBe(503);
      expect(result.durationMs).toBeLessThanOrEqual(10000);
      expect(result.requestId).toMatch(uuid);
      expect(result.cacheControl).toBe("no-store");
      expect(result.body).toEqual({
        error: {
          code: "UNAVAILABLE",
          message: genericMessage,
          requestId: result.requestId,
        },
      });
    }
    const logs = lines
      .filter((line) => !line.startsWith("API07_RESULT "))
      .map((line) => JSON.parse(line));
    expect(logs).toHaveLength(2);
    for (const [index, log] of logs.entries()) {
      expect(Object.keys(log).sort()).toEqual(
        ["time", "requestId", "method", "route", "status", "durationMs"].sort(),
      );
      expect(log.requestId).toBe(results[index].requestId);
      expect(log.status).toBe(503);
    }
    expect(output.stdout).not.toMatch(
      /postgresql:|fictional-password|fictional-login-password|outage@example\.test|Prisma|api07_unavailable|SESSION_SECRET/,
    );
    console.info(`API07_REAL_CONNECTION ${JSON.stringify(results)}`);
  }, 30000);

  it("finishes a never-resolving health dependency within the ten-second deadline", async () => {
    vi.useFakeTimers();
    vi.spyOn(db, "$queryRaw").mockReturnValue(
      new Promise(() => {}) as ReturnType<typeof db.$queryRaw>,
    );
    const log = vi.spyOn(console, "info").mockImplementation(() => {});
    let response: Awaited<ReturnType<typeof handle>> | undefined;
    const pending = handle(new Request("http://127.0.0.1/api/v1/health"), [
      "health",
    ]).then((value) => {
      response = value;
    });
    await vi.advanceTimersByTimeAsync(10000);
    expect(
      response,
      "The response must settle by the contractual deadline",
    ).toBeDefined();
    await pending;
    expect(response!.status).toBe(503);
    const requestId = response!.headers.get("x-request-id");
    expect(requestId).toMatch(uuid);
    expect(await response!.json()).toEqual({
      error: { code: "TIMEOUT", message: genericMessage, requestId },
    });
    const requestLog = JSON.parse(log.mock.calls[0][0]);
    expect(requestLog.durationMs).toBeLessThanOrEqual(10000);
    expect(vi.getTimerCount()).toBe(0);
    log.mockRestore();
    console.info(
      `API07_FAKE_CLOCK ${JSON.stringify({
        simulatedDependency: "never-resolving health query",
        status: response!.status,
        durationMs: requestLog.durationMs,
      })}`,
    );
  });

  it("does not expose an internal exception in the response or request log", async () => {
    const internal =
      "INTERNAL_API07_SENTINEL postgresql://private /private/api07";
    vi.spyOn(db, "$queryRaw").mockRejectedValue(new Error(internal));
    const log = vi.spyOn(console, "info").mockImplementation(() => {});
    const response = await handle(
      new Request("http://127.0.0.1/api/v1/health"),
      ["health"],
    );
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: {
        code: "UNAVAILABLE",
        message: genericMessage,
        requestId: expect.stringMatching(uuid),
      },
    });
    expect(JSON.stringify(log.mock.calls)).not.toContain(internal);
    expect(JSON.stringify(log.mock.calls)).not.toContain(
      "INTERNAL_API07_SENTINEL",
    );
  });
});
