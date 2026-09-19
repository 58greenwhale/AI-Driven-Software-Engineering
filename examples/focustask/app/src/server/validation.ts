import { z } from "zod";
import { ApiError } from "./errors";
export const uuid = z
  .string()
  .uuid()
  .transform((value) => value.toLowerCase());
const schema = z
  .object({
    title: z
      .string()
      .transform((s) => s.trim())
      .refine((s) => [...s].length > 0, "请输入任务标题")
      .refine((s) => [...s].length <= 100, "任务标题不能超过 100 个字符"),
    assigneeId: uuid.nullish().transform((v) => v ?? null),
    dueDate: z
      .string()
      .nullish()
      .transform((v) => v ?? null),
  })
  .strict();
export function todayInZone(zone: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (key: string) => parts.find((p) => p.type === key)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
export function validateTask(
  input: unknown,
  zone: string,
  now = new Date(),
  enforceCurrentDate = true,
) {
  const result = schema.safeParse(input);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues)
      fields[String(issue.path[0] ?? "form")] ??= issue.message;
    throw new ApiError(400, "VALIDATION_ERROR", "提交内容有误", fields);
  }
  const value = result.data;
  if (value.dueDate !== null) {
    const date = new Date(`${value.dueDate}T00:00:00.000Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(value.dueDate) ||
      Number.isNaN(date.valueOf()) ||
      date.toISOString().slice(0, 10) !== value.dueDate
    )
      throw new ApiError(400, "VALIDATION_ERROR", "提交内容有误", {
        dueDate: "请输入有效日期",
      });
    if (enforceCurrentDate && value.dueDate < todayInZone(zone, now))
      throw new ApiError(400, "VALIDATION_ERROR", "提交内容有误", {
        dueDate: "截止日期不能早于今天",
      });
  }
  return value;
}
