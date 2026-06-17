"use server";

import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { functionEnquirySchema } from "@/lib/validation/function-enquiry";
import { writeClient } from "@/lib/sanity/client";
import {
  sendTeamNotification,
  sendCustomerAutoresponder,
} from "@/lib/resend/client";
import { createTentativeCalendarEvent } from "@/lib/google/calendar";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { rateLimit } from "@/lib/security/rate-limit";

type ActionResult = { ok: false; errors: Record<string, string[]> } | null;

export async function submitFunctionEnquiry(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  // 0) Rate limit — 5 submissions per IP per hour
  const ip =
    headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  let limit: Awaited<ReturnType<typeof rateLimit>>;
  try {
    limit = await rateLimit(ip);
  } catch (err) {
    // Upstash unreachable. Fail closed with a friendly message rather than
    // 500-ing; nothing has been written yet.
    console.error("[function-enquiry] rate-limit check failed:", err);
    Sentry.captureException(err, { tags: { stage: "rate-limit" } });
    return {
      ok: false,
      errors: {
        _form: [
          "Something went wrong on our end. Try again in a moment, or email functions@beercade.com.au.",
        ],
      },
    };
  }
  if (!limit.success) {
    return {
      ok: false,
      errors: {
        _form: [
          "Too many submissions. Try again in an hour, or email functions@beercade.com.au.",
        ],
      },
    };
  }

  // 1) Validate
  const raw = Object.fromEntries(formData.entries());
  const parsed = functionEnquirySchema.safeParse({
    ...raw,
    food: raw.food === "on",
    consent: raw.consent === "on" ? true : raw.consent,
  });
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  // 2) Turnstile verification
  let turnstileOk = false;
  try {
    turnstileOk = await verifyTurnstile(data.turnstileToken, ip);
  } catch (err) {
    // Cloudflare siteverify unreachable. Same friendly failure; nothing written.
    console.error("[function-enquiry] turnstile verification failed:", err);
    Sentry.captureException(err, { tags: { stage: "turnstile" } });
    turnstileOk = false;
  }
  if (!turnstileOk) {
    return {
      ok: false,
      errors: { _form: ["Verification failed. Refresh and try again."] },
    };
  }

  // 3) Calendar tentative event (first — so the team can see it immediately)
  const { id: calendarEventId, htmlLink: calendarEventUrl } =
    await createTentativeCalendarEvent(data);

  // 4) Sanity archive
  const {
    turnstileToken: _t,
    honeypot: _h,
    consent: _c,
    ...archiveData
  } = data;
  await writeClient.create({
    _type: "functionEnquiry",
    submittedAt: new Date().toISOString(),
    ...archiveData,
    calendarEventId,
    status: "new",
  });

  // 5) Team notification + 6) customer autoresponder.
  // Non-blocking: the enquiry is already captured on the calendar and in Sanity,
  // so an email failure is reported to Sentry rather than 500-ing the customer
  // (which would also risk a duplicate resubmit, since this action isn't idempotent).
  try {
    await sendTeamNotification(data, calendarEventId, calendarEventUrl);
  } catch (err) {
    console.error("[function-enquiry] team notification failed:", err);
    Sentry.captureException(err, { tags: { stage: "team-notification" } });
  }
  try {
    await sendCustomerAutoresponder(data);
  } catch (err) {
    console.error("[function-enquiry] customer autoresponder failed:", err);
    Sentry.captureException(err, { tags: { stage: "customer-autoresponder" } });
  }

  // 7) Tag the Kit subscriber as completed so the "finish your enquiry" nudge
  // excludes them. They were created at step 1 (interest capture). Best-effort.
  const submittedTagId = process.env.KIT_TAG_FUNCTIONS_SUBMITTED;
  const kitApiKey = process.env.KIT_API_KEY;
  if (submittedTagId && kitApiKey) {
    try {
      await fetch(`https://api.kit.com/v4/tags/${submittedTagId}/subscribers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Kit-Api-Key": kitApiKey,
        },
        body: JSON.stringify({ email_address: data.email }),
      });
    } catch (err) {
      console.error("[function-enquiry] kit completion tag failed:", err);
      Sentry.captureException(err, { tags: { stage: "kit-completion-tag" } });
    }
  }

  revalidatePath("/studio");
  redirect("/thanks");
}
