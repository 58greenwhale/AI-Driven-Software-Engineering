import { describe, expect, it } from "vitest";
import { todayInZone, validateTask } from "../src/server/validation";
const now = new Date("2030-05-01T16:05:00Z");
describe("TASK-001 validation and date boundaries", () => {
  it("normalizes outer whitespace without collapsing internal spaces", () => {
    expect(
      validateTask({ title: "  prepare  review " }, "Asia/Shanghai", now),
    ).toEqual({ title: "prepare  review", assigneeId: null, dueDate: null });
  });
  it("counts Unicode code points and enforces the same 100-character boundary", () => {
    expect(
      validateTask({ title: "😀".repeat(100) }, "Asia/Shanghai").title,
    ).toHaveLength(200);
    expect(() =>
      validateTask({ title: "😀".repeat(101) }, "Asia/Shanghai"),
    ).toThrow();
    expect(() => validateTask({ title: "   " }, "Asia/Shanghai")).toThrow();
  });
  it("uses project calendar date across UTC midnight and rejects impossible dates", () => {
    expect(todayInZone("Asia/Shanghai", now)).toBe("2030-05-02");
    expect(() =>
      validateTask({ title: "x", dueDate: "2030-05-01" }, "Asia/Shanghai", now),
    ).toThrow();
    expect(
      validateTask({ title: "x", dueDate: "2030-05-02" }, "Asia/Shanghai", now)
        .dueDate,
    ).toBe("2030-05-02");
    for (const dueDate of ["2031-02-29", "2030-13-01", "2030-2-02", "invalid"])
      expect(() =>
        validateTask({ title: "x", dueDate }, "Asia/Shanghai", now),
      ).toThrow();
  });
  it("rejects client-controlled identity and status fields", () => {
    for (const key of ["createdBy", "projectId", "status"])
      expect(() =>
        validateTask({ title: "x", [key]: "forged" }, "Asia/Shanghai"),
      ).toThrow();
  });
});
