import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { db } from "./db";
import { ApiError } from "./errors";
import { hashPassword, verifyPassword } from "./password";
const dummy = hashPassword(randomBytes(32).toString("hex"));
export const cookieName = "focustask_session";
const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32)
    throw new Error("Missing session configuration");
  return value;
}
function sign(token: string) {
  return createHmac("sha256", secret()).update(token).digest("hex");
}
export function sessionToken(request: Request) {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1);
  if (!cookie) return null;
  const [token, signature] = cookie.split(".");
  if (!token || !signature || !/^[a-f0-9]{64}$/.test(signature)) return null;
  if (
    !timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(sign(token), "hex"),
    )
  )
    return null;
  return token;
}
export async function requireUser(request: Request) {
  const token = sessionToken(request);
  if (!token) throw new ApiError(401, "UNAUTHENTICATED", "请先登录");
  const session = await db.session.findUnique({
    where: { id: digest(token) },
    include: { user: true },
  });
  if (!session || session.expiresAt <= new Date())
    throw new ApiError(401, "UNAUTHENTICATED", "请重新登录");
  return session.user;
}
export const userView = (user: {
  id: string;
  email: string;
  displayName: string;
}) => ({ id: user.id, email: user.email, displayName: user.displayName });
export async function login(input: unknown) {
  if (!input || typeof input !== "object")
    throw new ApiError(400, "VALIDATION_ERROR", "请输入邮箱和密码");
  const { email, password, ...other } = input as Record<string, unknown>;
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    email.length > 254 ||
    password.length < 1 ||
    password.length > 1024 ||
    Object.keys(other).length
  )
    throw new ApiError(400, "VALIDATION_ERROR", "请输入有效的邮箱和密码");
  // Direct loopback deployment has no trusted reverse proxy. Do not trust spoofable X-Forwarded-For.
  const clientHash = digest("direct-loopback-client");
  const outcome = await db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${clientHash}))`;
    const attempts = await tx.loginAttempt.count({
      where: { clientHash, attemptedAt: { gt: new Date(Date.now() - 60000) } },
    });
    if (attempts >= 10) return { blocked: true } as const;
    const user = await tx.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    const valid = verifyPassword(password, user?.passwordHash ?? dummy);
    if (!user || !valid) {
      await tx.loginAttempt.create({ data: { clientHash } });
      return { invalid: true } as const;
    }
    const token = randomBytes(32).toString("hex");
    await tx.session.create({
      data: {
        id: digest(token),
        userId: user.id,
        expiresAt: new Date(Date.now() + 8 * 3600000),
      },
    });
    return { user: userView(user), token: `${token}.${sign(token)}` } as const;
  });
  if ("blocked" in outcome)
    throw new ApiError(429, "RATE_LIMITED", "尝试过于频繁，请稍后重试");
  if ("invalid" in outcome)
    throw new ApiError(401, "INVALID_CREDENTIALS", "邮箱或密码不正确");
  return outcome;
}
export async function logout(request: Request) {
  const token = sessionToken(request);
  if (token) await db.session.deleteMany({ where: { id: digest(token) } });
}
