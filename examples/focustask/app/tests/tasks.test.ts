import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { db } from "../src/server/db";
import { createTask, listTasks } from "../src/server/tasks";
const admin = "10000000-0000-4000-8000-000000000001";
const editor = "10000000-0000-4000-8000-000000000002";
const viewer = "10000000-0000-4000-8000-000000000003";
const outsider = "10000000-0000-4000-8000-000000000004";
const projectId = randomUUID();
beforeAll(async () => {
  if (!process.env.DATABASE_URL?.includes("/focustask_test?"))
    throw new Error("Test database required");
  await db.project.create({
    data: {
      id: projectId,
      name: "独立集成测试",
      createdBy: admin,
      members: {
        create: [
          { userId: admin, role: "admin" },
          { userId: editor, role: "editor" },
          { userId: viewer, role: "viewer" },
        ],
      },
    },
  });
});
afterAll(async () => {
  await db.idempotency.deleteMany({ where: { projectId } });
  await db.task.deleteMany({ where: { projectId } });
  await db.projectMember.deleteMany({ where: { projectId } });
  await db.project.deleteMany({ where: { id: projectId } });
  await db.$disconnect();
});
describe("TASK-001 database invariants", () => {
  it("CF-01/05/06 filters all three statuses without widening access", async () => {
    for (const status of ["todo", "in_progress", "done"])
      await db.task.create({
        data: { projectId, title: "筛选夹具", status, createdBy: admin },
      });
    for (const status of ["todo", "in_progress", "done"]) {
      const result = await listTasks(viewer, projectId, status);
      expect(result.total).toBe(1);
      expect(result.tasks.every((task) => task.status === status)).toBe(true);
    }
    await expect(listTasks(editor, projectId, "unknown")).rejects.toMatchObject(
      { status: 400 },
    );
    await expect(listTasks(outsider, projectId, "done")).rejects.toMatchObject({
      status: 404,
    });
  });
  it("AC-01/02 persists authoritative fields, nulls and assigned date", async () => {
    const task = await createTask(editor, projectId, randomUUID(), {
      title: "  核对交付  ",
    });
    expect(task).toMatchObject({
      title: "核对交付",
      createdBy: editor,
      status: "todo",
      assigneeId: null,
      dueDate: null,
      version: 1,
    });
    expect(await db.task.findUnique({ where: { id: task.id } })).not.toBeNull();
    const full = await createTask(admin, projectId, randomUUID(), {
      title: "安排工作",
      assigneeId: editor,
      dueDate: "2099-01-01",
    });
    expect(full.assignee?.id).toBe(editor);
    expect(full.dueDate).toBe("2099-01-01");
    expect(
      (await listTasks(viewer, projectId)).tasks.some((t) => t.id === task.id),
    ).toBe(true);
  });
  it("AC-07/08 concurrent retry returns one ID and one database record", async () => {
    const count = await db.task.count({ where: { projectId } });
    const key = randomUUID();
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        createTask(editor, projectId, key, { title: "幂等请求" }),
      ),
    );
    expect(new Set(results.map((r) => r.id)).size).toBe(1);
    expect(await db.task.count({ where: { projectId } })).toBe(count + 1);
    await expect(
      createTask(editor, projectId, key, { title: "不同内容" }),
    ).rejects.toMatchObject({ status: 409 });
  });
  it("AC-04/05/06 invalid values leave no partial record", async () => {
    const count = await db.task.count({ where: { projectId } });
    for (const input of [
      { title: "x".repeat(101) },
      { title: "不合法负责人", assigneeId: outsider },
      { title: "过期日期", dueDate: "2000-01-01" },
      { title: "伪造状态", status: "done" },
    ])
      await expect(
        createTask(editor, projectId, randomUUID(), input),
      ).rejects.toMatchObject({ status: 400 });
    expect(await db.task.count({ where: { projectId } })).toBe(count);
  });
  it("AC-09/10 server refuses Viewer and conceals project from non-member", async () => {
    const count = await db.task.count({ where: { projectId } });
    await expect(
      createTask(viewer, projectId, randomUUID(), { title: "被拒绝" }),
    ).rejects.toMatchObject({ status: 403 });
    await expect(
      createTask(outsider, projectId, randomUUID(), { title: "被拒绝" }),
    ).rejects.toMatchObject({ status: 404 });
    await expect(listTasks(outsider, projectId)).rejects.toMatchObject({
      status: 404,
    });
    expect(await db.task.count({ where: { projectId } })).toBe(count);
  });
  it("AC-08 preserves first result when retry crosses the project midnight", async () => {
    const key = randomUUID();
    const value = { title: "跨日重试", dueDate: "2030-05-01" };
    const before = new Date("2030-05-01T15:59:00Z");
    const after = new Date("2030-05-01T16:01:00Z");
    const first = await createTask(editor, projectId, key, value, before);
    const retry = await createTask(editor, projectId, key, value, after);
    expect(retry.id).toBe(first.id);
    await expect(
      createTask(editor, projectId, randomUUID(), value, after),
    ).rejects.toMatchObject({ status: 400 });
  });
  it("UUID case variants share the same idempotency lock and normalized fingerprint", async () => {
    const key = randomUUID();
    const before = await db.task.count({ where: { projectId } });
    const values = await Promise.all([
      createTask(editor, projectId, key, {
        title: "大小写重试",
        assigneeId: editor,
      }),
      createTask(editor, projectId.toUpperCase(), key.toUpperCase(), {
        title: "大小写重试",
        assigneeId: editor.toUpperCase(),
      }),
    ]);
    expect(values[0].id).toBe(values[1].id);
    expect(await db.task.count({ where: { projectId } })).toBe(before + 1);
  });
  it("AC-11 archive and changed permissions are checked even on retries", async () => {
    const key = randomUUID();
    await createTask(editor, projectId, key, { title: "归档前" });
    const count = await db.task.count({ where: { projectId } });
    await db.project.update({
      where: { id: projectId },
      data: { status: "archived" },
    });
    try {
      await expect(
        createTask(editor, projectId, key, { title: "归档前" }),
      ).rejects.toMatchObject({ status: 409, code: "PROJECT_ARCHIVED" });
    } finally {
      await db.project.update({
        where: { id: projectId },
        data: { status: "active" },
      });
    }
    await db.projectMember.update({
      where: { projectId_userId: { projectId, userId: editor } },
      data: { role: "viewer" },
    });
    try {
      await expect(
        createTask(editor, projectId, key, { title: "归档前" }),
      ).rejects.toMatchObject({ status: 403 });
    } finally {
      await db.projectMember.update({
        where: { projectId_userId: { projectId, userId: editor } },
        data: { role: "editor" },
      });
    }
    expect(await db.task.count({ where: { projectId } })).toBe(count);
  });
});
