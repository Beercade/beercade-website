import { timingSafeEqual } from "node:crypto";

// Pure helpers for the function-enquiry confirmation webhook
// (/api/sanity/function-confirmed). Kept free of I/O and of the "server-only"
// guard so the decision logic and secret check can be unit-tested directly.

export type FunctionEnquiryWebhookPayload = {
  _type?: string;
  status?: string;
  calendarEventId?: string | null;
};

export type CalendarAction = "confirm" | "delete" | "ignore";

export type SecretCheck = "ok" | "not-configured" | "mismatch";

// Decide what the calendar should do for an incoming enquiry change.
// Only functionEnquiry docs that carry a stored calendarEventId can act:
//   confirmed → promote the tentative event (build-spec §8.6 step 4)
//   lost      → delete the event            (build-spec §8.6 step 5)
// Everything else (new / replied / quoted, missing event id, other types) is a
// deliberate no-op.
export function decideCalendarAction(
  payload: FunctionEnquiryWebhookPayload,
): CalendarAction {
  if (payload._type !== "functionEnquiry") return "ignore";
  if (!payload.calendarEventId) return "ignore";
  if (payload.status === "confirmed") return "confirm";
  if (payload.status === "lost") return "delete";
  return "ignore";
}

// Constant-time comparison of the URL `?secret=` against the configured webhook
// secret. Mirrors the gate on /api/revalidate but uses its own secret so the
// enquiry webhook can be rotated independently.
//
// Both sides are trimmed before comparing. A trailing newline or space pasted
// into the Vercel env var or the Sanity webhook URL is invisible but otherwise
// causes a permanent 401; the rest of the Sanity config (client.ts) already
// trims its env vars for exactly this reason. Secrets are random hex/base64
// with no meaningful leading/trailing whitespace, so trimming is safe.
//
// Returns a discriminated result so the caller can log *why* a 401 happened
// (env var absent vs. value mismatch) without ever logging the secret itself.
export function checkWebhookSecret(
  provided: string | null,
  expected: string | undefined = process.env.SANITY_FUNCTION_WEBHOOK_SECRET,
): SecretCheck {
  const exp = expected?.trim();
  const got = provided?.trim();

  if (!exp) return "not-configured";
  if (!got) return "mismatch";

  const a = Buffer.from(got);
  const b = Buffer.from(exp);
  if (a.length !== b.length) return "mismatch";

  return timingSafeEqual(a, b) ? "ok" : "mismatch";
}

// Boolean convenience wrapper.
export function verifyWebhookSecret(
  provided: string | null,
  expected: string | undefined = process.env.SANITY_FUNCTION_WEBHOOK_SECRET,
): boolean {
  return checkWebhookSecret(provided, expected) === "ok";
}
