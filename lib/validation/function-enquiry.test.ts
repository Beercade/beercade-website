import { describe, it, expect } from "vitest";
import { functionEnquirySchema } from "./function-enquiry";

// A valid baseline payload. `preferredDate` is far in the future so the
// "today onwards" refinement never flakes as the clock advances.
function validInput(overrides: Record<string, unknown> = {}) {
  return {
    name: "Jo Bloggs",
    email: "jo@example.com",
    phone: "02 9000 0000",
    groupSize: 12,
    preferredDate: "2099-12-31",
    preferredTime: "18-22",
    occasion: "birthday",
    machinePreference: "Godzilla LE",
    drinksStyle: "bar-tab",
    food: true,
    notes: "Eight of us are pinball regulars.",
    consent: true,
    honeypot: "",
    turnstileToken: "0123456789abcdef",
    ...overrides,
  };
}

describe("functionEnquirySchema", () => {
  it("accepts a well-formed enquiry", () => {
    const result = functionEnquirySchema.safeParse(validInput());
    expect(result.success).toBe(true);
  });

  it("rejects a filled honeypot (bot trap)", () => {
    const result = functionEnquirySchema.safeParse(
      validInput({ honeypot: "i am a bot" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = functionEnquirySchema.safeParse(
      validInput({ email: "not-an-email" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects a date in the past", () => {
    const result = functionEnquirySchema.safeParse(
      validInput({ preferredDate: "2000-01-01" }),
    );
    expect(result.success).toBe(false);
  });

  it("enforces the group-size floor of 6", () => {
    const result = functionEnquirySchema.safeParse(
      validInput({ groupSize: 4 }),
    );
    expect(result.success).toBe(false);
  });

  it("enforces the group-size ceiling of 100", () => {
    const result = functionEnquirySchema.safeParse(
      validInput({ groupSize: 250 }),
    );
    expect(result.success).toBe(false);
  });

  it("coerces a numeric string group size", () => {
    const result = functionEnquirySchema.safeParse(
      validInput({ groupSize: "20" }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.groupSize).toBe(20);
  });

  it("requires consent to be true", () => {
    const result = functionEnquirySchema.safeParse(
      validInput({ consent: false }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects an unknown drinksStyle", () => {
    const result = functionEnquirySchema.safeParse(
      validInput({ drinksStyle: "byo" }),
    );
    expect(result.success).toBe(false);
  });

  it("allows an empty optional phone", () => {
    const result = functionEnquirySchema.safeParse(validInput({ phone: "" }));
    expect(result.success).toBe(true);
  });
});
