"use server";

import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().trim().max(80).optional(),
  source: z.literal("tokens"),
});

const KIT_API = "https://api.kit.com/v4";

// Unredeemable-from-guessing, easy-to-read code. Excludes 0/O/1/I/L.
function generateVoucherCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BC-${code}`;
}

// Human-readable expiry N days out, in Sydney time, e.g. "15 June 2026".
function voucherExpiry(days: number): string {
  const sydney = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Australia/Sydney" })
  );
  sydney.setDate(sydney.getDate() + days);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${sydney.getDate()} ${months[sydney.getMonth()]} ${sydney.getFullYear()}`;
}

/**
 * $5-tokens lead-magnet signup. Same shape as submit-newsletter-signup, with a
 * first name (the voucher email greets people by name) and the dedicated tokens
 * sequence + tags. The unique voucher code and its 7-day expiry are minted here
 * and written to the subscriber's custom fields, so the voucher email's merge
 * tags resolve without any external automation.
 */
export async function submitTokenSignup(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
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
  // not fail the signup. Each only fires when its id is configured.
  const formId = process.env.KIT_FORM_ID_TOKENS;
  const sequenceId = process.env.KIT_SEQUENCE_ID_TOKENS;
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
