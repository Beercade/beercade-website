import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  decideCalendarAction,
  verifyWebhookSecret,
  checkWebhookSecret,
  confirmedSummary,
} from "./function-webhook";

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

  it("accepts a secret with trailing whitespace/newline on the provided value", () => {
    // Reproduces the real failure: a newline pasted onto the Sanity URL's
    // ?secret=. Trimming must make this match.
    expect(verifyWebhookSecret(`${KEY}\n`)).toBe(true);
    expect(verifyWebhookSecret(`${KEY} `)).toBe(true);
  });

  it("accepts when the configured secret itself has trailing whitespace", () => {
    process.env.SANITY_FUNCTION_WEBHOOK_SECRET = `${KEY}\n`;
    expect(verifyWebhookSecret(KEY)).toBe(true);
  });
});

describe("confirmedSummary", () => {
  it("replaces the [TENTATIVE] tag with [CONFIRMED]", () => {
    expect(confirmedSummary("[TENTATIVE] Dana · 8 pax · birthday")).toBe(
      "[CONFIRMED] Dana · 8 pax · birthday",
    );
  });

  it("is idempotent when already confirmed", () => {
    expect(confirmedSummary("[CONFIRMED] Dana · 8 pax · birthday")).toBe(
      "[CONFIRMED] Dana · 8 pax · birthday",
    );
  });

  it("adds the tag when there is no existing prefix", () => {
    expect(confirmedSummary("Dana · 8 pax · birthday")).toBe(
      "[CONFIRMED] Dana · 8 pax · birthday",
    );
  });

  it("matches the tag case-insensitively", () => {
    expect(confirmedSummary("[tentative] Dana")).toBe("[CONFIRMED] Dana");
  });
});

describe("checkWebhookSecret", () => {
  const KEY = "test-webhook-secret";
  const original = process.env.SANITY_FUNCTION_WEBHOOK_SECRET;

  beforeEach(() => {
    process.env.SANITY_FUNCTION_WEBHOOK_SECRET = KEY;
  });
  afterEach(() => {
    process.env.SANITY_FUNCTION_WEBHOOK_SECRET = original;
  });

  it("returns ok for a matching secret", () => {
    expect(checkWebhookSecret(KEY)).toBe("ok");
  });

  it("returns mismatch for a wrong secret", () => {
    expect(checkWebhookSecret("nope")).toBe("mismatch");
  });

  it("returns mismatch for a missing provided secret", () => {
    expect(checkWebhookSecret(null)).toBe("mismatch");
  });

  it("returns not-configured when the env var is absent", () => {
    delete process.env.SANITY_FUNCTION_WEBHOOK_SECRET;
    expect(checkWebhookSecret(KEY)).toBe("not-configured");
  });
});
