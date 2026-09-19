import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
const config = JSON.parse(
  fs.readFileSync(new URL("../../.runtime/test.json", import.meta.url), "utf8"),
);
test("production baseline: 500 tasks, 20 members, page/API/CLS samples", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "CDP network emulation is measured on Chromium only",
  );
  test.setTimeout(120000);
  const db = new PrismaClient({ datasourceUrl: config.DATABASE_URL });
  const projectId = randomUUID();
  const admin = "10000000-0000-4000-8000-000000000001";
  const userIds = Array.from({ length: 19 }, () => randomUUID());
  const times: number[] = [];
  const apiTimes: number[] = [];
  const cls: number[] = [];
  const filterTimes: number[] = [];
  try {
    await db.user.createMany({
      data: userIds.map((id, i) => ({
        id,
        email: `perf-${id}@example.test`,
        displayName: `测试成员${i}`,
        passwordHash: "disabled-fixture-account",
      })),
    });
    await db.project.create({
      data: {
        id: projectId,
        name: "性能验证专用项目",
        createdBy: admin,
        members: {
          create: [admin, ...userIds].map((userId, i) => ({
            userId,
            role: i === 0 ? "admin" : "viewer",
          })),
        },
      },
    });
    await db.task.createMany({
      data: Array.from({ length: 500 }, (_, i) => ({
        projectId,
        title: `性能验证任务 ${i}`,
        createdBy: admin,
        status: ["todo", "in_progress", "done"][i % 3],
      })),
    });
    const login = await page.request.post("/api/v1/auth/login", {
      headers: { Origin: config.APP_BASE_URL },
      data: {
        email: "admin@example.test",
        password: config.FOCUSTASK_SEED_PASSWORD,
      },
    });
    expect(login.status()).toBe(200);
    const client = await page.context().newCDPSession(page);
    await client.send("Network.enable");
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 100,
      downloadThroughput: 1250000,
      uploadThroughput: 1250000,
    });
    await page.addInitScript(() => {
      (window as unknown as { observedCLS: number }).observedCLS = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layout = entry as PerformanceEntry & {
            hadRecentInput: boolean;
            value: number;
          };
          if (!layout.hadRecentInput)
            (window as unknown as { observedCLS: number }).observedCLS +=
              layout.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    for (let i = 0; i < 20; i++) {
      const start = performance.now();
      await page.goto(`/projects/${projectId}/tasks`);
      await expect(page.getByRole("listitem")).toHaveCount(500);
      times.push(performance.now() - start);
      cls.push(
        await page.evaluate(
          () => (window as unknown as { observedCLS: number }).observedCLS,
        ),
      );
    }
    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      const response = await page.request.post(
        `/api/v1/projects/${projectId}/tasks`,
        {
          headers: {
            Origin: config.APP_BASE_URL,
            "Idempotency-Key": randomUUID(),
          },
          data: { title: `API样本 ${i}` },
        },
      );
      apiTimes.push(performance.now() - start);
      expect(response.status()).toBe(201);
    }
    const p95 = (samples: number[]) =>
      [...samples].sort((a, b) => a - b)[Math.ceil(samples.length * 0.95) - 1];
    for (let i = 0; i < 20; i++) {
      const status = i % 2 ? "done" : "in_progress";
      const start = performance.now();
      await page.getByLabel("状态", { exact: true }).selectOption(status);
      await expect(page.getByRole("listitem")).toHaveCount(
        status === "done" ? 166 : 167,
      );
      filterTimes.push(performance.now() - start);
    }
    const result = {
      capturedAt: new Date().toISOString(),
      environment: {
        node: process.version,
        cpus: os.cpus().length,
        memoryGB: os.totalmem() / 1024 ** 3,
        browser: browserName,
        networkRTTms: 100,
        downloadMbps: 10,
      },
      caveat:
        "Native host is not the original 4-core/8GB reference machine; values apply to this measured local environment.",
      taskCount: 500,
      memberCount: 20,
      pageSamplesMs: times,
      apiSamplesMs: apiTimes,
      filterSamplesMs: filterTimes,
      clsSamples: cls,
      pageP95ms: p95(times),
      apiP95ms: p95(apiTimes),
      filterP95ms: p95(filterTimes),
      maxCLS: Math.max(...cls),
    };
    fs.mkdirSync(".runtime/metrics", { recursive: true });
    fs.writeFileSync(
      ".runtime/metrics/v02-performance.json",
      JSON.stringify(result, null, 2),
    );
    expect(result.pageP95ms).toBeLessThanOrEqual(2500);
    expect(result.apiP95ms).toBeLessThanOrEqual(500);
    expect(result.filterP95ms).toBeLessThanOrEqual(1000);
    expect(result.maxCLS).toBeLessThanOrEqual(0.1);
  } finally {
    await db.idempotency.deleteMany({ where: { projectId } });
    await db.task.deleteMany({ where: { projectId } });
    await db.projectMember.deleteMany({ where: { projectId } });
    await db.project.deleteMany({ where: { id: projectId } });
    await db.user.deleteMany({ where: { id: { in: userIds } } });
    await db.$disconnect();
  }
});
