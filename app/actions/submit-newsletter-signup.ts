"use server";

import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  source: z.enum(["footer", "popup"]),
});

const KIT_API = "https://api.kit.com/v4";

export async function submitNewsletterSignup(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, error: "Enter a valid email address." };

  const apiKey = process.env.KIT_API_KEY;
  // Footer and exit-popup both feed the same newsletter list. The popup uses
  // its own form when one is configured, otherwise it falls back to the footer
  // form so a signup is never silently dropped.
  const formId =
    parsed.data.source === "popup"
      ? process.env.KIT_FORM_ID_POPUP || process.env.KIT_FORM_ID_FOOTER
      : process.env.KIT_FORM_ID_FOOTER;

  if (!apiKey || !formId) {
    return { ok: false, error: "Newsletter sign-up is not yet available." };
  }

  const headers = {
    "Content-Type": "application/json",
    "X-Kit-Api-Key": apiKey,
  };
  const email_address = parsed.data.email;

  const res = await fetch(`${KIT_API}/forms/${formId}/subscriptions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email_address }),
  });

  if (!res.ok) {
    return {
      ok: false,
      error: "Sign-up failed. Try again or email hello@beercade.com.au.",
    };
  }

  // Trigger the welcome sequence. Subscribing to a form does not, on its own,
  // enrol the subscriber in a sequence — so we add them explicitly. Best-effort:
  // the subscriber is already on the list, so a failure here must not fail the
  // signup (the welcome can be re-synced from Kit).
  const sequenceId = process.env.KIT_SEQUENCE_ID_NEWSLETTER;
  if (sequenceId) {
    try {
      await fetch(`${KIT_API}/sequences/${sequenceId}/subscriptions`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email_address }),
      });
    } catch {
      // Swallow — signup already succeeded against the form.
    }
  }

  return { ok: true };
}
