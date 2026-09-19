import {
  test,
  expect,
  type Page,
  type APIRequestContext,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
const config = JSON.parse(
  fs.readFileSync(new URL("../../.runtime/test.json", import.meta.url), "utf8"),
);
const project = "20000000-0000-4000-8000-000000000001";
const empty = "20000000-0000-4000-8000-000000000002";
const archived = "20000000-0000-4000-8000-000000000003";
const db = new PrismaClient({ datasourceUrl: config.DATABASE_URL });
test.afterAll(async () => {
  await db.$disconnect();
});
async function login(page: Page, role = "editor") {
  await page.goto("/login");
  await page.getByLabel("邮箱", { exact: true }).fill(`${role}@example.test`);
  await page
    .getByLabel("密码", { exact: true })
    .fill(config.FOCUSTASK_SEED_PASSWORD);
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
}
async function apiLogin(request: APIRequestContext, role: string) {
  const response = await request.post("/api/v1/auth/login", {
    headers: { Origin: config.APP_BASE_URL },
    data: {
      email: `${role}@example.test`,
      password: config.FOCUSTASK_SEED_PASSWORD,
    },
  });
  expect(response.status()).toBe(200);
}
test("API-01/03/05 and AC-09/10: auth, server permissions and logout", async ({
  request,
}) => {
  expect((await request.get("/api/v1/me")).status()).toBe(401);
  await apiLogin(request, "viewer");
  const before = await (
    await request.get(`/api/v1/projects/${project}/tasks`)
  ).json();
  const write = await request.post(`/api/v1/projects/${project}/tasks`, {
    headers: { Origin: config.APP_BASE_URL, "Idempotency-Key": randomUUID() },
    data: { title: "禁止Viewer写入" },
  });
  expect(write.status()).toBe(403);
  const after = await (
    await request.get(`/api/v1/projects/${project}/tasks`)
  ).json();
  expect(after.data.total).toBe(before.data.total);
  expect(
    (
      await request.get("/api/v1/projects/20000000-0000-4000-8000-000000000004")
    ).status(),
  ).toBe(404);
  const out = await request.post("/api/v1/auth/logout", {
    headers: { Origin: config.APP_BASE_URL },
  });
  expect(await out.json()).toEqual({ data: { signedOut: true } });
  expect((await request.get("/api/v1/me")).status()).toBe(401);
});
test("AC-01/03/07: empty validation, create once and persist after refresh", async ({
  page,
}) => {
  await login(page);
  await page.goto(`/projects/${project}/tasks`);
  await page.getByRole("button", { name: "新建任务", exact: true }).click();
  await expect(page.getByLabel("任务标题")).toBeFocused();
  await page.getByRole("button", { name: "创建任务", exact: true }).click();
  await expect(page.getByText("请输入任务标题")).toBeVisible();
  const title = `创建验收 ${randomUUID().slice(0, 8)}`;
  await page.getByLabel("任务标题").fill(title);
  await page.getByRole("button", { name: "创建任务", exact: true }).dblclick();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByText(title, { exact: true })).toHaveCount(1);
  await page.reload();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
});
test("AC-08/12: lost response retains input; retry recovers same task", async ({
  page,
}) => {
  await login(page);
  await page.goto(`/projects/${project}/tasks`);
  await page.getByRole("button", { name: "新建任务", exact: true }).click();
  const title = `网络恢复 ${randomUUID().slice(0, 8)}`;
  await page.getByLabel("任务标题").fill(title);
  let first = true;
  const keys: string[] = [];
  await page.route(`**/api/v1/projects/${project}/tasks`, async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    keys.push(route.request().headers()["idempotency-key"]);
    if (first) {
      first = false;
      const response = await route.fetch();
      expect(response.status()).toBe(201);
      await route.abort("failed");
    } else await route.continue();
  });
  await page.getByRole("button", { name: "创建任务", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("创建失败，请重试");
  await expect(page.getByLabel("任务标题")).toHaveValue(title);
  await page.getByRole("button", { name: "重试创建" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByText(title, { exact: true })).toHaveCount(1);
  expect(keys).toHaveLength(2);
  expect(keys[0]).toBe(keys[1]);
  const result = await page.request.get(`/api/v1/projects/${project}/tasks`);
  const body = await result.json();
  expect(
    body.data.tasks.filter((t: { title: string }) => t.title === title),
  ).toHaveLength(1);
});
for (const [width, height] of [
  [1440, 900],
  [1024, 768],
  [768, 1024],
  [390, 844],
  [320, 844],
  [1920, 1080],
]) {
  test(`UI states and keyboard ${width}x${height}`, async ({
    page,
  }, testInfo) => {
    const browser = testInfo.project.name;
    await page.setViewportSize({ width, height });
    await login(page);
    await page.goto(`/projects/${project}/tasks`);
    await expect(page.getByRole("heading", { name: "网站改版" })).toBeVisible();
    await expect(page.getByRole("listitem").first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `.runtime/screenshots/${browser}-${width}-normal.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "新建任务", exact: true }).click();
    await expect(page.getByLabel("任务标题")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("负责人")).toBeFocused();
    await page.getByRole("button", { name: "创建任务", exact: true }).click();
    await expect(page.getByText("请输入任务标题")).toBeVisible();
    await page.screenshot({
      path: `.runtime/screenshots/${browser}-${width}-field-error.png`,
      fullPage: true,
    });
    const scan = await new AxeBuilder({ page }).analyze();
    expect(
      scan.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      ),
    ).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "新建任务", exact: true }),
    ).toBeFocused();
    await page.goto(`/projects/${empty}/tasks`);
    await expect(
      page.getByRole("heading", { name: "还没有任务" }),
    ).toBeVisible();
    await page.screenshot({
      path: `.runtime/screenshots/${browser}-${width}-empty.png`,
      fullPage: true,
    });
    await page.goto(`/projects/${archived}/tasks`);
    await expect(page.getByText("该项目已归档，只能查看")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "新建任务", exact: true }),
    ).toHaveCount(0);
    await page.screenshot({
      path: `.runtime/screenshots/${browser}-${width}-archived.png`,
      fullPage: true,
    });
    await page.route(`**/api/v1/projects/${project}/tasks`, async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: { code: "UNAVAILABLE", message: "test" },
        }),
      });
    });
    await page.goto(`/projects/${project}/tasks`);
    await expect(
      page.getByRole("heading", { name: "任务加载失败" }),
    ).toBeVisible();
    await page.screenshot({
      path: `.runtime/screenshots/${browser}-${width}-failure.png`,
      fullPage: true,
    });
    await page.unrouteAll({ behavior: "wait" });
    let release!: () => void;
    const hold = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(`**/api/v1/projects/${project}/tasks`, async (route) => {
      await hold;
      await route.continue();
    });
    await page.goto(`/projects/${project}/tasks`);
    await expect(
      page.getByRole("status", { name: "任务加载中" }),
    ).toBeVisible();
    await page.screenshot({
      path: `.runtime/screenshots/${browser}-${width}-loading.png`,
      fullPage: true,
    });
    release();
    await expect(page.getByRole("listitem").first()).toBeVisible();
    await page.unrouteAll({ behavior: "wait" });
    await login(page, "viewer");
    await page.goto(`/projects/${project}/tasks`);
    await expect(
      page.getByText("只读成员 · 你可以查看本项目的任务"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "新建任务", exact: true }),
    ).toHaveCount(0);
    await page.screenshot({
      path: `.runtime/screenshots/${browser}-${width}-viewer.png`,
      fullPage: true,
    });
    await page.goto("/projects/20000000-0000-4000-8000-000000000004/tasks");
    await expect(
      page.getByRole("heading", { name: "未找到页面" }),
    ).toBeVisible();
    await expect(page.getByText("其他项目", { exact: true })).toHaveCount(0);
    await page.screenshot({
      path: `.runtime/screenshots/${browser}-${width}-not-found.png`,
      fullPage: true,
    });
  });
}
test("AC-02/06/11: field dates, assignee, archive during open form", async ({
  page,
}) => {
  await login(page);
  await page.goto(`/projects/${empty}/tasks`);
  await page
    .getByRole("button", { name: "新建任务", exact: true })
    .first()
    .click();
  await page.getByLabel("任务标题").fill("归档期间的表单");
  await page.getByLabel("截止日期").fill("2000-01-01");
  await page.getByRole("button", { name: "创建任务", exact: true }).click();
  await expect(page.getByText("截止日期不能早于今天")).toBeVisible();
  await expect(page.getByLabel("截止日期")).toBeFocused();
  await page.getByLabel("截止日期").fill("2099-01-01");
  await page
    .getByLabel("负责人")
    .selectOption("10000000-0000-4000-8000-000000000002");
  const before = await db.task.count({ where: { projectId: empty } });
  await db.project.update({
    where: { id: empty },
    data: { status: "archived" },
  });
  try {
    await page.getByRole("button", { name: "创建任务", exact: true }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(
      page.getByText("该项目已归档，只能查看").first(),
    ).toBeVisible();
    expect(await db.task.count({ where: { projectId: empty } })).toBe(before);
  } finally {
    await db.project.update({
      where: { id: empty },
      data: { status: "active" },
    });
  }
});
test("API-02/06: origin, expired session and failed-login rate limit", async ({
  request,
}) => {
  const foreign = await request.post("/api/v1/auth/login", {
    headers: { Origin: "https://invalid.example.test" },
    data: {
      email: "viewer@example.test",
      password: config.FOCUSTASK_SEED_PASSWORD,
    },
  });
  expect(foreign.status()).toBe(403);
  await apiLogin(request, "viewer");
  await db.session.updateMany({
    where: { userId: "10000000-0000-4000-8000-000000000003" },
    data: { expiresAt: new Date(0) },
  });
  expect((await request.get("/api/v1/me")).status()).toBe(401);
  await db.loginAttempt.deleteMany();
  try {
    for (let i = 0; i < 10; i++)
      expect(
        (
          await request.post("/api/v1/auth/login", {
            headers: { Origin: config.APP_BASE_URL },
            data: {
              email: "not-present@example.test",
              password: "intentionally-invalid-test-input",
            },
          })
        ).status(),
      ).toBe(401);
    expect(
      (
        await request.post("/api/v1/auth/login", {
          headers: { Origin: config.APP_BASE_URL },
          data: {
            email: "not-present@example.test",
            password: "intentionally-invalid-test-input",
          },
        })
      ).status(),
    ).toBe(429);
  } finally {
    await db.loginAttempt.deleteMany();
  }
});
test("permission removal while form is open closes it and hides project", async ({
  page,
}) => {
  const id = randomUUID();
  const editorId = "10000000-0000-4000-8000-000000000002";
  await db.project.create({
    data: {
      id,
      name: "权限变化独立项目",
      createdBy: "10000000-0000-4000-8000-000000000001",
      members: { create: { userId: editorId, role: "editor" } },
    },
  });
  try {
    await login(page);
    await page.goto(`/projects/${id}/tasks`);
    await page
      .getByRole("button", { name: "新建任务", exact: true })
      .first()
      .click();
    await page.getByLabel("任务标题").fill("权限移除后提交");
    await db.projectMember.delete({
      where: { projectId_userId: { projectId: id, userId: editorId } },
    });
    await page.getByRole("button", { name: "创建任务", exact: true }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(
      page.getByRole("heading", { name: "未找到页面" }),
    ).toBeVisible();
    await expect(page.getByText("权限变化独立项目")).toHaveCount(0);
    expect(await db.task.count({ where: { projectId: id } })).toBe(0);
  } finally {
    await db.projectMember.deleteMany({ where: { projectId: id } });
    await db.project.delete({ where: { id } });
  }
});
test("200% zoom equivalent layout and long content remain operable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 720, height: 450 }); // 1440x900 at 200% browser zoom gives this CSS viewport.
  await login(page);
  await page.goto(`/projects/${project}/tasks`);
  await page.getByRole("button", { name: "新建任务", exact: true }).click();
  const longTitle = `${randomUUID().slice(0, 8)}${"长".repeat(92)}`;
  await page.getByLabel("任务标题").fill(longTitle);
  const box = await page
    .getByRole("button", { name: "创建任务", exact: true })
    .boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y + box!.height).toBeLessThanOrEqual(450);
  await page.getByRole("button", { name: "创建任务", exact: true }).click();
  await expect(page.getByText(longTitle)).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: ".runtime/screenshots/200-percent-equivalent.png",
    fullPage: true,
  });
});
