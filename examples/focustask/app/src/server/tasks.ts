import { createHash } from "node:crypto";
import type { Prisma, Task, User } from "@prisma/client";
import { db } from "./db";
import { ApiError } from "./errors";
import { uuid, validateTask } from "./validation";

type Client = Prisma.TransactionClient;
export async function membership(
  userId: string,
  projectId: string,
  client: Client = db,
) {
  const parsed = uuid.safeParse(projectId);
  if (!parsed.success) throw new ApiError(404, "NOT_FOUND", "未找到项目");
  projectId = parsed.data;
  const member = await client.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    include: { project: true },
  });
  if (!member) throw new ApiError(404, "NOT_FOUND", "未找到项目");
  return member;
}
export function taskView(
  task: Task & { assignee: Pick<User, "id" | "displayName"> | null },
) {
  return {
    ...task,
    dueDate: task.dueDate?.toISOString().slice(0, 10) ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}
export async function listTasks(
  userId: string,
  projectId: string,
  status = "",
) {
  await membership(userId, projectId);
  projectId = projectId.toLowerCase();
  if (status && !["todo", "in_progress", "done"].includes(status))
    throw new ApiError(400, "VALIDATION_ERROR", "无效的任务状态", {
      status: "请选择有效状态",
    });
  const tasks = await db.task.findMany({
    where: { projectId, ...(status ? { status } : {}) },
    include: { assignee: { select: { id: true, displayName: true } } },
    orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
  });
  return { tasks: tasks.map(taskView), total: tasks.length };
}
export async function createTask(
  userId: string,
  projectId: string,
  key: string | null,
  raw: unknown,
  now = new Date(),
) {
  if (!uuid.safeParse(key).success)
    throw new ApiError(400, "VALIDATION_ERROR", "缺少有效的幂等键");
  await membership(userId, projectId);
  projectId = projectId.toLowerCase();
  key = key!.toLowerCase();
  return db.$transaction(async (tx) => {
    // Serialize same-key writes. Row share locks prevent a concurrent archive/role change during authorization and insert.
    const lock = `${userId}:${projectId}:${key}`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lock}))`;
    await tx.$queryRaw`SELECT id FROM projects WHERE id = ${projectId}::uuid FOR SHARE`;
    await tx.$queryRaw`SELECT user_id FROM project_members WHERE project_id = ${projectId}::uuid AND user_id = ${userId}::uuid FOR SHARE`;
    const member = await membership(userId, projectId, tx);
    if (member.role === "viewer")
      throw new ApiError(403, "FORBIDDEN", "你没有权限创建任务");
    if (member.project.status === "archived")
      throw new ApiError(409, "PROJECT_ARCHIVED", "该项目已归档，只能查看");
    const value = validateTask(raw, member.project.timeZone, now, false);
    const fingerprint = createHash("sha256")
      .update(JSON.stringify(value))
      .digest("hex");
    const identity = { userId, projectId, key: key! };
    const prior = await tx.idempotency.findUnique({
      where: { userId_projectId_key: identity },
      include: {
        task: {
          include: { assignee: { select: { id: true, displayName: true } } },
        },
      },
    });
    if (prior) {
      if (prior.fingerprint !== fingerprint)
        throw new ApiError(409, "IDEMPOTENCY_CONFLICT", "重复请求的内容不一致");
      return taskView(prior.task);
    }
    validateTask(value, member.project.timeZone, now);
    if (value.assigneeId) {
      await tx.$queryRaw`SELECT user_id FROM project_members WHERE project_id = ${projectId}::uuid AND user_id = ${value.assigneeId}::uuid FOR SHARE`;
      if (
        !(await tx.projectMember.findUnique({
          where: { projectId_userId: { projectId, userId: value.assigneeId } },
        }))
      )
        throw new ApiError(400, "VALIDATION_ERROR", "提交内容有误", {
          assigneeId: "所选负责人不属于当前项目",
        });
    }
    const task = await tx.task.create({
      data: {
        projectId,
        createdBy: userId,
        title: value.title,
        assigneeId: value.assigneeId,
        dueDate: value.dueDate ? new Date(`${value.dueDate}T00:00:00Z`) : null,
      },
      include: { assignee: { select: { id: true, displayName: true } } },
    });
    await tx.idempotency.create({
      data: { ...identity, fingerprint, taskId: task.id },
    });
    return taskView(task);
  });
}
