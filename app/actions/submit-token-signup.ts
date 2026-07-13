"use server";

import { z } from "zod";
import { generateVoucherCode, voucherExpiry } from "@/lib/kit/voucher";
import { signupGuard } from "@/lib/security/signup-guard";

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().trim().max(80).optional(),
  source: z.literal("tokens"),
});

const KIT_API = "https://api.kit.com/v4";

/**
 * $5-tokens lead-magnet signup. Same shape as submit-newsletter-signup, with a
 * first name (the welcome email greets people by name) and the lead-magnet
 * source tag. The unique voucher code and its 7-day expiry are minted here and
 * written to the subscriber's custom fields, so the welcome email's merge tags
 * resolve without any external automation. It feeds the same welcome sequence
 * as the newsletter signup, so the voucher lives in one email everywhere.
 */
export async function submitTokenSignup(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const guard = await signupGuard(formData, "rl:token-signup");
  if (guard.verdict === "silent-drop") return { ok: true };
  if (guard.verdict === "reject") return { ok: false, error: guard.error };

  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success)
    return { ok: false, error: "Enter a valid email address." };

  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Sign-up is not yet available." };
  }

  const headers = {
    "Content-Type": "application/json",
    "X-Kit-Api-Key": apiKey,
  };

  const email_address = parsed.data.email;
  const firstName = parsed.data.firstName?.length
    ? parsed.data.firstName
    : undefined;

  // Mint the voucher up front so the fields exist before the sequence email
  // ever releases. A re-signup overwrites with a fresh code and a new 7-day
  // window, which is the behaviour we want.
  const fields: Record<string, string> = {
    voucher_code: generateVoucherCode(),
    voucher_expiry: voucherExpiry(7),
  };
  if (firstName) fields.first_name = firstName;

  // Kit v4 needs the subscriber to exist before it can join a form or sequence;
  // creating (upserting) them here is the step that actually subscribes them.
  // Custom fields (voucher code, expiry, first name) are set in the same call.
  const created = await fetch(`${KIT_API}/subscribers`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email_address,
      ...(firstName ? { first_name: firstName } : {}),
      fields,
    }),
  });

  if (!created.ok) {
    return {
      ok: false,
      error: "Sign-up failed. Try again or email hello@beercade.com.au.",
    };
  }

  const body = JSON.stringify({ email_address });

  // Form attribution, sequence enrolment, and the two tracking tags are all
  // best-effort: the subscriber already exists, so a hiccup on any of these must
  // not fail the signup. Each only fires when its id is configured. Enrols into
  // the shared welcome sequence (same as the newsletter signup) so the voucher
  // is delivered from one email everywhere.
  const formId = process.env.KIT_FORM_ID_TOKENS;
  const sequenceId = process.env.KIT_SEQUENCE_ID_NEWSLETTER;
  const tagIds = [
    process.env.KIT_TAG_TOKENS_OFFER,
    process.env.KIT_TAG_TOKENS_SOURCE,
  ].filter((id): id is string => Boolean(id));

  await Promise.allSettled([
    formId
      ? fetch(`${KIT_API}/forms/${formId}/subscribers`, {
          method: "POST",
          headers,
          body,
        })
      : Promise.resolve(),
    sequenceId
      ? fetch(`${KIT_API}/sequences/${sequenceId}/subscribers`, {
          method: "POST",
          headers,
          body,
        })
      : Promise.resolve(),
    ...tagIds.map((id) =>
      fetch(`${KIT_API}/tags/${id}/subscribers`, {
        method: "POST",
        headers,
        body,
      })
    ),
  ]);

  return { ok: true };
}
