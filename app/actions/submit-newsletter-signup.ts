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
  if (!apiKey) {
    return { ok: false, error: "Newsletter sign-up is not yet available." };
  }

  const headers = {
    "Content-Type": "application/json",
    "X-Kit-Api-Key": apiKey,
  };
  const email_address = parsed.data.email;
  const body = JSON.stringify({ email_address });

  // Kit v4 requires the subscriber to exist before it can be added to a form or
  // sequence — posting a brand-new email straight to a form returns 404. So we
  // create (or upsert) the subscriber first; this is the step that actually
  // subscribes them.
  const created = await fetch(`${KIT_API}/subscribers`, {
    method: "POST",
    headers,
    body,
  });

  if (!created.ok) {
    return {
      ok: false,
      error: "Sign-up failed. Try again or email hello@beercade.com.au.",
    };
  }

  // Attribute the signup to the newsletter form (footer + popup share it; popup
  // falls back to the footer form when no dedicated popup form is configured).
  const formId =
    parsed.data.source === "popup"
      ? process.env.KIT_FORM_ID_POPUP || process.env.KIT_FORM_ID_FOOTER
      : process.env.KIT_FORM_ID_FOOTER;

  // Enrol in the welcome sequence so it actually fires. Both calls are
  // best-effort: the subscriber already exists, so a hiccup here must not fail
  // the signup (form attribution / welcome can be re-synced from Kit).
  const sequenceId = process.env.KIT_SEQUENCE_ID_NEWSLETTER;

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
  ]);

  return { ok: true };
}
