import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import {
  confirmCalendarEvent,
  deleteCalendarEvent,
} from "@/lib/google/calendar";
import {
  decideCalendarAction,
  verifyWebhookSecret,
  type FunctionEnquiryWebhookPayload,
} from "@/lib/sanity/function-webhook";

// Sanity webhook → Bookings calendar sync for function enquiries.
//
// Configure in sanity.io as a webhook on `functionEnquiry` create/update with a
// GROQ projection of {_type, status, calendarEventId} and point it at:
//   https://beercade.com.au/api/sanity/function-confirmed?secret=<SANITY_FUNCTION_WEBHOOK_SECRET>
//
// Automates build-spec §8.6: when a team member flips an enquiry's status in the
// studio, the matching tentative event is promoted (confirmed) or removed (lost)
// rather than relying on them to also edit the calendar by hand.
//
// Guarantees:
//   - Secret verified before we trust anything.
//   - Idempotent: re-confirming is a no-op; deleting an already-gone event 200s.
//   - Non-acting changes (new/replied/quoted, no event id) acknowledge with 200
//     so Sanity doesn't retry events we intentionally ignore.

export const dynamic = "force-dynamic";

function errorStatus(err: unknown): number | undefined {
  const e = err as { code?: unknown; status?: unknown };
  if (typeof e?.code === "number") return e.code;
  if (typeof e?.status === "number") return e.status;
  return undefined;
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!verifyWebhookSecret(secret)) {
    return NextResponse.json({ error: "invalid secret" }, { status: 401 });
  }

  let payload: FunctionEnquiryWebhookPayload;
  try {
    payload = (await req.json()) as FunctionEnquiryWebhookPayload;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const action = decideCalendarAction(payload);
  if (action === "ignore") {
    return NextResponse.json({ ignored: true });
  }

  const eventId = payload.calendarEventId!;
  try {
    if (action === "confirm") {
      await confirmCalendarEvent(eventId);
    } else {
      await deleteCalendarEvent(eventId);
    }
  } catch (err) {
    // A "lost" enquiry whose event is already gone (404/410) is still success —
    // the desired end state is reached, so don't make Sanity retry forever.
    const status = errorStatus(err);
    if (action === "delete" && (status === 404 || status === 410)) {
      return NextResponse.json({ ok: true, idempotent: true });
    }
    console.error("[function-confirmed] calendar update failed:", err);
    Sentry.captureException(err, {
      tags: { stage: "function-confirmed", action },
    });
    return NextResponse.json(
      { error: "calendar update failed" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, action });
}
