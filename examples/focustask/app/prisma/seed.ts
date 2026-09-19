import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/server/password";
const db = new PrismaClient();
const password = process.env.FOCUSTASK_SEED_PASSWORD;
if (!password || !process.env.DATABASE_URL?.includes("/focustask_"))
  throw new Error("Dedicated local environment required");
try {
  const users = [];
  for (const [index, role] of [
    "admin",
    "editor",
    "viewer",
    "outsider",
  ].entries()) {
    const id = `10000000-0000-4000-8000-00000000000${index + 1}`;
    users.push(
      await db.user.upsert({
        where: { id },
        update: {},
        create: {
          id,
          email: `${role}@example.test`,
          displayName: [
            "示例管理员",
            "示例编辑者",
            "示例观察者",
            "其他项目成员",
          ][index],
          passwordHash: hashPassword(password),
        },
      }),
    );
  }
  for (const [i, name] of [
    "网站改版",
    "空白项目",
    "归档资料",
    "其他项目",
  ].entries()) {
    const id = `20000000-0000-4000-8000-00000000000${i + 1}`;
    await db.project.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name,
        status: i === 2 ? "archived" : "active",
        createdBy: users[i === 3 ? 3 : 0].id,
      },
    });
    for (const [j, user] of users.entries()) {
      if ((i === 3) !== (j === 3)) continue;
      await db.projectMember.upsert({
        where: { projectId_userId: { projectId: id, userId: user.id } },
        update: {},
        create: {
          projectId: id,
          userId: user.id,
          role: j === 3 ? "admin" : ["admin", "editor", "viewer"][j],
        },
      });
    }
  }
  for (const [i, title] of [
    "确认首页内容",
    "准备交互原型",
    "整理验收材料",
  ].entries()) {
    const id = `30000000-0000-4000-8000-00000000000${i + 1}`;
    await db.task.upsert({
      where: { id },
      update: {},
      create: {
        id,
        projectId: "20000000-0000-4000-8000-000000000001",
        title,
        status: ["todo", "in_progress", "done"][i],
        createdBy: users[0].id,
        assigneeId: i ? null : users[1].id,
      },
    });
  }
  console.log(
    "Fictional fixtures ready; existing data preserved. Credentials are in ignored local configuration.",
  );
} finally {
  await db.$disconnect();
}
