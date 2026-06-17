import { describe, it, expect } from "vitest";
import { yearFromManufactureDate } from "./client";

describe("yearFromManufactureDate", () => {
  it("extracts the year from an ISO date", () => {
    expect(yearFromManufactureDate("1992-03-01")).toBe(1992);
  });

  it("extracts the year from a bare year", () => {
    expect(yearFromManufactureDate("2021")).toBe(2021);
  });

  it("returns null for null input", () => {
    expect(yearFromManufactureDate(null)).toBeNull();
  });

  it("returns null for a non-date string", () => {
    expect(yearFromManufactureDate("sometime in the 90s")).toBeNull();
  });
});
