"use server";

import { z } from "zod";
import { signupGuard } from "@/lib/security/signup-guard";

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().trim().min(1).max(80),
});

const KIT_API = "https://api.kit.com/v4";

/**
 * Step 1 of the function enquiry flow: bank the lead before asking for detail.
 * Creates/updates the Kit subscriber and tags them so the "finish your enquiry"
 * nudge can chase anyone who doesn't go on to complete the full form. Kept
 * deliberately tiny — name + email only — so we capture interest with minimal
 * friction; the full qualifying form is shown straight after.
 */
export async function submitFunctionInterest(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const guard = await signupGuard(formData, "rl:function-interest");
  if (guard.verdict === "silent-drop") return { ok: true };
  if (guard.verdict === "reject") return { ok: false, error: guard.error };

  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, error: "Enter your name and a valid email address." };
  }

  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Enquiries aren't available just now." };
  }

  const headers = {
    "Content-Type": "application/json",
    "X-Kit-Api-Key": apiKey,
  };
  const email_address = parsed.data.email;
  const firstName = parsed.data.firstName;

  const created = await fetch(`${KIT_API}/subscribers`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email_address,
      first_name: firstName,
      fields: { first_name: firstName },
    }),
  });

  if (!created.ok) {
    return {
      ok: false,
      error:
        "Something went wrong. Try again, or email functions@beercade.com.au.",
    };
  }

  // Tag for the nudge funnel + general segmentation. Best-effort: the subscriber
  // already exists, so a tag hiccup must not lose the lead. Each fires only when
  // its id is configured.
  const body = JSON.stringify({ email_address });
  const tagIds = [
    process.env.KIT_TAG_FUNCTIONS_INTEREST, // funnel: function-interest (nudge trigger)
    process.env.KIT_TAG_INTEREST_FUNCTIONS, // interest: functions (segmentation)
  ].filter((id): id is string => Boolean(id));

  await Promise.allSettled(
    tagIds.map((id) =>
      fetch(`${KIT_API}/tags/${id}/subscribers`, {
        method: "POST",
        headers,
        body,
      })
    )
  );

  return { ok: true };
}
