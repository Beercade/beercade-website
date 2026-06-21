import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { decideCalendarAction, verifyWebhookSecret } from "./function-webhook";

describe("decideCalendarAction", () => {
  const eventId = "evt_123";

  it("confirms a confirmed enquiry with a calendar event", () => {
    expect(
      decideCalendarAction({
        _type: "functionEnquiry",
        status: "confirmed",
        calendarEventId: eventId,
      }),
    ).toBe("confirm");
  });

  it("deletes the event for a lost enquiry", () => {
    expect(
      decideCalendarAction({
        _type: "functionEnquiry",
        status: "lost",
        calendarEventId: eventId,
      }),
    ).toBe("delete");
  });

  it("ignores in-progress statuses", () => {
    for (const status of ["new", "replied", "quoted"]) {
      expect(
        decideCalendarAction({
          _type: "functionEnquiry",
          status,
          calendarEventId: eventId,
        }),
      ).toBe("ignore");
    }
  });

  it("ignores a confirmed enquiry that has no calendar event", () => {
    expect(
      decideCalendarAction({
        _type: "functionEnquiry",
        status: "confirmed",
        calendarEventId: null,
      }),
    ).toBe("ignore");
  });

  it("ignores documents of other types", () => {
    expect(
      decideCalendarAction({
        _type: "leagueRegistration",
        status: "confirmed",
        calendarEventId: eventId,
      }),
    ).toBe("ignore");
  });
});

describe("verifyWebhookSecret", () => {
  const KEY = "test-webhook-secret";
  const original = process.env.SANITY_FUNCTION_WEBHOOK_SECRET;

  beforeEach(() => {
    process.env.SANITY_FUNCTION_WEBHOOK_SECRET = KEY;
  });
  afterEach(() => {
    process.env.SANITY_FUNCTION_WEBHOOK_SECRET = original;
  });

  it("accepts the matching secret", () => {
    expect(verifyWebhookSecret(KEY)).toBe(true);
  });

  it("rejects a wrong secret", () => {
    expect(verifyWebhookSecret("nope")).toBe(false);
  });

  it("rejects a missing secret", () => {
    expect(verifyWebhookSecret(null)).toBe(false);
  });

  it("rejects when the secret is not configured", () => {
    delete process.env.SANITY_FUNCTION_WEBHOOK_SECRET;
    expect(verifyWebhookSecret(KEY)).toBe(false);
  });
});
