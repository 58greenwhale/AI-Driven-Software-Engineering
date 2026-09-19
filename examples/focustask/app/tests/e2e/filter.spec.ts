import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
const config = JSON.parse(
  fs.readFileSync(new URL("../../.runtime/test.json", import.meta.url), "utf8"),
);
const db = new PrismaClient({ datasourceUrl: config.DATABASE_URL });
test.afterAll(async () => {
  await db.$disconnect();
});
test('CF-05/06 Viewer, archived filtering and invalid URL recovery', async ({page})=>{
  const login=await page.request.post('/api/v1/auth/login',{headers:{Origin:config.APP_BASE_URL},data:{email:'viewer@example.test',password:config.FOCUSTASK_SEED_PASSWORD}});expect(login.status()).toBe(200);
  await page.goto('/projects/20000000-0000-4000-8000-000000000001/tasks?status=done');
  await expect(page.getByLabel('状态',{exact:true})).toHaveValue('done');await expect(page.getByText('整理验收材料')).toBeVisible();await expect(page.getByRole('button',{name:'新建任务',exact:true})).toHaveCount(0);
  await page.goto('/projects/20000000-0000-4000-8000-000000000003/tasks?status=todo');await expect(page.getByText('该项目已归档，只能查看')).toBeVisible();await expect(page.getByLabel('状态',{exact:true})).toHaveValue('todo');await expect(page.getByRole('button',{name:'新建任务',exact:true})).toHaveCount(0);
  await page.goto('/projects/20000000-0000-4000-8000-000000000001/tasks?status=invalid');await expect(page.getByRole('heading',{name:'筛选状态无效，请清除筛选'})).toBeVisible();await page.getByRole('button',{name:'清除筛选'}).click();await expect(page.getByLabel('状态',{exact:true})).toHaveValue('');await expect(page.getByRole('listitem').first()).toBeVisible();
});
for (const [width, height] of [
  [1440, 900],
  [1024, 768],
  [768, 1024],
  [390, 844],
]) {
  test(`CF-01–07 state, URL, empty, create and race ${width}`, async ({
    page,
  }, info) => {
    const id = randomUUID();
    const editor = "10000000-0000-4000-8000-000000000002";
    await db.project.create({
      data: {
        id,
        name: "筛选独立验收",
        createdBy: editor,
        members: { create: { userId: editor, role: "editor" } },
        tasks: {
          create: [
            { title: "已完成夹具", status: "done", createdBy: editor },
            { title: "待处理夹具", status: "todo", createdBy: editor },
          ],
        },
      },
    });
    try {
      await page.setViewportSize({ width, height });
      const login = await page.request.post("/api/v1/auth/login", {
        headers: { Origin: config.APP_BASE_URL },
        data: {
          email: "editor@example.test",
          password: config.FOCUSTASK_SEED_PASSWORD,
        },
      });
      expect(login.status()).toBe(200);
      await page.goto(`/projects/${id}/tasks`);
      await expect(page.getByRole("listitem")).toHaveCount(2);
      await page.getByLabel("状态", { exact: true }).selectOption("done");
      await expect(page).toHaveURL(/status=done/);
      await expect(page.getByRole("listitem")).toHaveCount(1);
      await expect(page.getByText("已完成夹具")).toBeVisible();
      await page.reload();
      await expect(page.getByLabel("状态", { exact: true })).toHaveValue(
        "done",
      );
      await expect(page.getByRole("listitem")).toHaveCount(1);
      await page.screenshot({
        path: `.runtime/screenshots/${info.project.name}-${width}-filtered.png`,
        fullPage: true,
      });
      await page.getByLabel("状态", { exact: true }).selectOption("todo");
      await expect(page.getByText("待处理夹具")).toBeVisible();
      await page.goBack();
      await expect(page.getByLabel("状态", { exact: true })).toHaveValue(
        "done",
      );
      await expect(page.getByText("已完成夹具")).toBeVisible();
      await page.getByRole("button", { name: "新建任务", exact: true }).click();
      const title = `筛选内新增${randomUUID().slice(0, 8)}`;
      await page.getByLabel("任务标题").fill(title);
      await page.getByRole("button", { name: "创建任务", exact: true }).click();
      await expect(
        page.getByText("任务已创建，但不符合当前筛选条件"),
      ).toBeVisible();
      await expect(page.getByText(title)).toHaveCount(0);
      await expect(page).toHaveURL(/status=done/);
      expect(
        await db.task.count({
          where: { projectId: id, title, status: "todo" },
        }),
      ).toBe(1);
      await page.screenshot({
        path: `.runtime/screenshots/${info.project.name}-${width}-filtered-create.png`,
        fullPage: true,
      });
      await page
        .getByLabel("状态", { exact: true })
        .selectOption("in_progress");
      await expect(
        page.getByRole("heading", { name: "没有符合条件的任务" }),
      ).toBeVisible();
      await page.screenshot({
        path: `.runtime/screenshots/${info.project.name}-${width}-filtered-empty.png`,
        fullPage: true,
      });
      await page.getByRole("button", { name: "清除筛选" }).click();
      await expect(page.getByRole("listitem")).toHaveCount(3);
      const invalid = await page.request.get(
        `/api/v1/projects/${id}/tasks?status=garbage`,
      );
      expect(invalid.status()).toBe(400);
      let release!: () => void;
      let entered!: () => void;
      const waiting = new Promise<void>((r) => {
        release = r;
      });
      const started = new Promise<void>((r) => {
        entered = r;
      });
      await page.route(
        `**/api/v1/projects/${id}/tasks?status=done`,
        async (route) => {
          entered();
          await waiting;
          await route.continue();
        },
      );
      await page.getByLabel("状态", { exact: true }).selectOption("done");
      await started;
      await page.getByLabel("状态", { exact: true }).selectOption("todo");
      await expect(page.getByRole("listitem")).toHaveCount(2);
      release();
      await page.unrouteAll({ behavior: "wait" });
      await expect(page.getByLabel("状态", { exact: true })).toHaveValue(
        "todo",
      );
      await expect(page.getByText("已完成夹具")).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.getByLabel("状态", { exact: true }).selectOption("done");
      await expect(page.getByText("已完成夹具")).toBeVisible();
      let finishPost!: () => void;
      let postEntered!: () => void;
      const postWait = new Promise<void>((r) => {
        finishPost = r;
      });
      const postReady = new Promise<void>((r) => {
        postEntered = r;
      });
      await page.route(`**/api/v1/projects/${id}/tasks`, async (route) => {
        if (route.request().method() !== "POST") return route.continue();
        const response = await route.fetch();
        postEntered();
        await postWait;
        await route.fulfill({ response });
      });
      await page.getByRole("button", { name: "新建任务", exact: true }).click();
      const navigatedTitle = `创建中返回${randomUUID().slice(0, 8)}`;
      await page.getByLabel("任务标题").fill(navigatedTitle);
      await page.getByRole("button", { name: "创建任务", exact: true }).click();
      await postReady;
      await page.goBack();
      await expect(page).toHaveURL(/status=todo/);
      finishPost();
      await expect(page.getByRole("dialog")).not.toBeVisible();
      await expect(page.getByLabel("状态", { exact: true })).toHaveValue(
        "todo",
      );
      await expect(page.getByText(navigatedTitle)).toBeVisible();
      await expect(page.getByText("已完成夹具")).toHaveCount(0);
      await expect(page.getByText("任务已创建", { exact: true })).toBeVisible();
      await page.unrouteAll({ behavior: "wait" });
    } finally {
      await db.idempotency.deleteMany({ where: { projectId: id } });
      await db.task.deleteMany({ where: { projectId: id } });
      await db.projectMember.deleteMany({ where: { projectId: id } });
      await db.project.delete({ where: { id } });
    }
  });
}
