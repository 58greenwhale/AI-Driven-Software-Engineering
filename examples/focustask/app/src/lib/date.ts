export function displayDate(
  value: string | null,
  timeZone: string,
  now = new Date(),
) {
  if (!value) return { label: "无截止日期", overdue: false };
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  const today = `${get("year")}-${get("month")}-${get("day")}`;
  return {
    label:
      value === today ? "今天" : value < today ? `${value} · 已逾期` : value,
    overdue: value < today,
  };
}
