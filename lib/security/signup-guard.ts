import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";
import { rateLimit } from "./rate-limit";

export type SignupGuardResult =
  | { verdict: "allow" }
  | { verdict: "silent-drop" }
  | { verdict: "reject"; error: string };

/**
 * Bot gate for the lightweight Kit signup actions (function interest,
 * newsletter, token offer). Two layers: a honeypot field only bots fill, and a
 * per-IP rate limit (5/hour, windowed per form via the prefix). Honeypot hits
 * are dropped silently; returning success teaches the bot nothing. Turnstile
 * stays exclusive to the full enquiry form, which writes beyond a mailing list.
 */
export async function signupGuard(
  formData: FormData,
  prefix: string
): Promise<SignupGuardResult> {
  const honeypot = formData.get("honeypot");
  if (typeof honeypot === "string" && honeypot.length > 0) {
    return { verdict: "silent-drop" };
  }

  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "anonymous";
  try {
    const limit = await rateLimit(ip, prefix);
    if (!limit.success) {
      return {
        verdict: "reject",
        error: "Too many sign-ups. Try again in an hour.",
      };
    }
  } catch (err) {
    // Upstash unreachable. Fail closed; nothing has been written yet.
    console.error(`[${prefix}] rate-limit check failed:`, err);
    Sentry.captureException(err, { tags: { stage: "rate-limit" } });
    return {
      verdict: "reject",
      error: "Something went wrong on our end. Try again in a moment.",
    };
  }

  return { verdict: "allow" };
}
