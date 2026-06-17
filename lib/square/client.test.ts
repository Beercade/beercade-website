import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createHmac } from "node:crypto";
import { verifyWebhookSignature } from "./client";

const KEY = "test-signature-key";
const URL = "https://beercade.com.au/api/square/webhook";
const BODY = JSON.stringify({ type: "payment.updated", data: {} });

function sign(url: string, body: string, key = KEY): string {
  return createHmac("sha256", key)
    .update(url + body)
    .digest("base64");
}

describe("verifyWebhookSignature", () => {
  const original = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;

  beforeEach(() => {
    process.env.SQUARE_WEBHOOK_SIGNATURE_KEY = KEY;
  });
  afterEach(() => {
    process.env.SQUARE_WEBHOOK_SIGNATURE_KEY = original;
  });

  it("accepts a correctly signed payload", () => {
    expect(
      verifyWebhookSignature({
        rawBody: BODY,
        signatureHeader: sign(URL, BODY),
        notificationUrl: URL,
      }),
    ).toBe(true);
  });

  it("rejects a tampered body", () => {
    expect(
      verifyWebhookSignature({
        rawBody: BODY + "x",
        signatureHeader: sign(URL, BODY),
        notificationUrl: URL,
      }),
    ).toBe(false);
  });

  it("rejects a mismatched notification URL", () => {
    expect(
      verifyWebhookSignature({
        rawBody: BODY,
        signatureHeader: sign(URL, BODY),
        notificationUrl: "https://evil.example.com/api/square/webhook",
      }),
    ).toBe(false);
  });

  it("rejects a missing signature header", () => {
    expect(
      verifyWebhookSignature({
        rawBody: BODY,
        signatureHeader: null,
        notificationUrl: URL,
      }),
    ).toBe(false);
  });

  it("rejects when the signing key is not configured", () => {
    delete process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
    expect(
      verifyWebhookSignature({
        rawBody: BODY,
        signatureHeader: sign(URL, BODY),
        notificationUrl: URL,
      }),
    ).toBe(false);
  });
});
