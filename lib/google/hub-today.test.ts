import { describe, expect, it } from "vitest";
import { sanitiseSummary, sydneyDayBounds } from "./hub-today";

describe("sydneyDayBounds", () => {
  it("covers the Sydney calendar day in winter (AEST, +10:00)", () => {
    // 2026-07-14T20:00:00Z is 2026-07-15 06:00 in Sydney.
    const bounds = sydneyDayBounds(new Date("2026-07-14T20:00:00Z"));
    expect(bounds.timeMin).toBe("2026-07-15T00:00:00+10:00");
    expect(bounds.timeMax).toBe("2026-07-15T23:59:59+10:00");
  });

  it("covers the Sydney calendar day in summer (AEDT, +11:00)", () => {
    const bounds = sydneyDayBounds(new Date("2026-01-10T20:00:00Z"));
    expect(bounds.timeMin).toBe("2026-01-11T00:00:00+11:00");
    expect(bounds.timeMax).toBe("2026-01-11T23:59:59+11:00");
  });
});

describe("sanitiseSummary", () => {
  it("extracts pax and occasion from a site-format summary, dropping the name", () => {
    const result = sanitiseSummary("[CONFIRMED] Jane Citizen · 40 pax · 30th birthday");
    expect(result).toEqual({ pax: 40, occasion: "30th birthday" });
    expect(JSON.stringify(result)).not.toContain("Jane");
  });

  it("returns nulls for a hand-typed summary that does not match the format", () => {
    expect(sanitiseSummary("Smith booking, big group")).toEqual({
      pax: null,
      occasion: null,
    });
  });

  it("still finds pax when the occasion segment is missing", () => {
    expect(sanitiseSummary("[CONFIRMED] Jane Citizen · 40 pax")).toEqual({
      pax: 40,
      occasion: null,
    });
  });
});
