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
// enquiry webhook can be rotated independently. Returns false when either side
// is missing rather than throwing, so a misconfigured webhook fails closed.
export function verifyWebhookSecret(
  provided: string | null,
  expected: string | undefined = process.env.SANITY_FUNCTION_WEBHOOK_SECRET,
): boolean {
  if (!expected || !provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}
