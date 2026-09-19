import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "./db";
import { ApiError } from "./errors";
import { cookieName, login, logout, requireUser, userView } from "./auth";
import { createTask, listTasks, membership } from "./tasks";

async function body(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new ApiError(400, "VALIDATION_ERROR", "请求必须为 JSON");
  if (Number(request.headers.get("content-length") ?? 0) > 8192)
    throw new ApiError(413, "PAYLOAD_TOO_LARGE", "请求内容过长");
  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  if (!reader) throw new ApiError(400, "VALIDATION_ERROR", "请求内容为空");
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 8192) {
      await reader.cancel();
      throw new ApiError(413, "PAYLOAD_TOO_LARGE", "请求内容过长");
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ApiError(400, "VALIDATION_ERROR", "请求内容不是有效 JSON");
  }
}
function projectView(
  p: { id: string; name: string; status: string; timeZone: string },
  role: string,
) {
  return {
    id: p.id,
    name: p.name,
    status: p.status,
    timeZone: p.timeZone,
    role,
  };
}
async function dispatch(request: Request, segments: string[]) {
  const route = segments.join("/");
  const method = request.method;
  const base = process.env.APP_BASE_URL;
  if (!base || !process.env.DATABASE_URL || !process.env.SESSION_SECRET)
    throw new Error("Missing application configuration");
  if (
    method !== "GET" &&
    request.headers.get("origin") !== new URL(base).origin
  )
    throw new ApiError(403, "ORIGIN_REJECTED", "请求来源无效");
  const json = (data: unknown, status = 200) =>
    NextResponse.json({ data }, { status });
  if (route === "health" && method === "GET") {
    await db.$queryRaw`SELECT 1`;
    return json({ status: "ok", database: "ok", version: "0.2.0" });
  }
  if (route === "auth/login" && method === "POST") {
    const result = await login(await body(request));
    const response = json(result.user);
    response.cookies.set(cookieName, result.token, {
      httpOnly: true,
      secure: base.startsWith("https:"),
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 3600,
    });
    return response;
  }
  if (route === "auth/logout" && method === "POST") {
    await logout(request);
    const response = json({ signedOut: true });
    response.cookies.set(cookieName, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: base.startsWith("https:"),
      path: "/",
      maxAge: 0,
    });
    return response;
  }
  const user = await requireUser(request);
  if (route === "me" && method === "GET") return json(userView(user));
  if (route === "projects" && method === "GET") {
    const members = await db.projectMember.findMany({
      where: { userId: user.id },
      include: { project: true },
      orderBy: { project: { name: "asc" } },
    });
    return json(members.map((m) => projectView(m.project, m.role)));
  }
  if (segments[0] === "projects" && segments[1]) {
    const projectId = segments[1].toLowerCase();
    if (segments.length === 2 && method === "GET") {
      const member = await membership(user.id, projectId);
      const members = await db.projectMember.findMany({
        where: { projectId },
        include: { user: true },
        orderBy: [{ user: { displayName: "asc" } }, { user: { email: "asc" } }],
      });
      return json({
        project: projectView(member.project, member.role),
        members: members.map((m) => ({ ...userView(m.user), role: m.role })),
      });
    }
    if (segments.length === 3 && segments[2] === "tasks") {
      if (method === "GET")
        return json(
          await listTasks(
            user.id,
            projectId,
            new URL(request.url).searchParams.get("status") ?? "",
          ),
        );
      if (method === "POST")
        return json(
          await createTask(
            user.id,
            projectId,
            request.headers.get("idempotency-key"),
            await body(request),
          ),
          201,
        );
    }
  }
  throw new ApiError(404, "NOT_FOUND", "未找到资源");
}
export async function handle(request: Request, segments: string[]) {
  const requestId = randomUUID();
  const start = Date.now();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let response: NextResponse;
  try {
    response = await Promise.race([
      dispatch(request, segments),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () =>
            reject(new ApiError(503, "TIMEOUT", "服务暂不可用，请稍后重试")),
          9500,
        );
      }),
    ]);
  } catch (error) {
    const known = error instanceof ApiError;
    response = NextResponse.json(
      {
        error: {
          code: known ? error.code : "UNAVAILABLE",
          message: known ? error.message : "服务暂不可用，请稍后重试",
          ...(known && error.fields ? { fields: error.fields } : {}),
          requestId,
        },
      },
      { status: known ? error.status : 503 },
    );
  } finally {
    if (timer) clearTimeout(timer);
  }
  response.headers.set("x-request-id", requestId);
  response.headers.set("cache-control", "no-store");
  console.info(
    JSON.stringify({
      time: new Date().toISOString(),
      requestId,
      method: request.method,
      route: segments
        .map((s) => (/^[0-9a-f-]{36}$/i.test(s) ? ":id" : s))
        .join("/"),
      status: response.status,
      durationMs: Date.now() - start,
    }),
  );
  return response;
}
