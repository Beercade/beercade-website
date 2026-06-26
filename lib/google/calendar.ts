import { google } from "googleapis";
import { ExternalAccountClient } from "google-auth-library";
import { getVercelOidcToken } from "@vercel/oidc";
import type { FunctionEnquiryInput } from "@/lib/validation/function-enquiry";
import { confirmedSummary } from "@/lib/sanity/function-webhook";

// Keyless auth via Workload Identity Federation.
// The beercade.com.au org enforces iam.disableServiceAccountKeyCreation, so we
// federate Vercel's per-invocation OIDC token to Google STS and impersonate the
// (keyless) service account rather than shipping a downloaded private key.
// Setup + env vars: https://vercel.com/docs/oidc/gcp
function getCalendarClient() {
  const authClient = ExternalAccountClient.fromJSON({
    type: "external_account",
    audience: `//iam.googleapis.com/projects/${process.env.GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${process.env.GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`,
    subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
    token_url: "https://sts.googleapis.com/v1/token",
    service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${process.env.GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
    subject_token_supplier: {
      // Vercel injects a fresh OIDC token per invocation. Wrapped so the
      // supplier's context arg isn't forwarded to getVercelOidcToken's options.
      getSubjectToken: () => getVercelOidcToken(),
    },
  });

  if (!authClient) {
    throw new Error(
      "Failed to initialise Google ExternalAccountClient — check the GCP_* federation env vars."
    );
  }

  authClient.scopes = ["https://www.googleapis.com/auth/calendar"];
  return google.calendar({ version: "v3", auth: authClient });
}

const TIME_WINDOWS: Record<string, [number, number]> = {
  "17-21": [17, 21],
  "18-22": [18, 22],
  "19-23": [19, 23],
  other: [18, 22],
};

export async function createTentativeCalendarEvent(
  data: FunctionEnquiryInput
): Promise<{ id: string; htmlLink?: string }> {
  const calendar = getCalendarClient();
  const [startHour, endHour] = TIME_WINDOWS[data.preferredTime] ?? [18, 22];
  const dateBase = data.preferredDate;

  const event = await calendar.events.insert({
    calendarId: process.env.GOOGLE_BOOKINGS_CALENDAR_ID!,
    requestBody: {
      summary: `[TENTATIVE] ${data.name} · ${data.groupSize} pax · ${data.occasion}`,
      description: [
        `Function enquiry from ${data.name} (${data.email}${data.phone ? ", " + data.phone : ""})`,
        `Group size: ${data.groupSize}`,
        `Drinks: ${data.drinksStyle}`,
        `Food: ${data.food ? "yes" : "no"}`,
        data.machinePreference ? `Machines: ${data.machinePreference}` : null,
        data.notes ? `Notes: ${data.notes}` : null,
        "",
        "Workflow: flip status to 'confirmed' when booked. Update the matching enquiry in Sanity studio.",
      ]
        .filter(Boolean)
        .join("\n"),
      start: {
        dateTime: `${dateBase}T${String(startHour).padStart(2, "0")}:00:00+10:00`,
        timeZone: "Australia/Sydney",
      },
      end: {
        dateTime: `${dateBase}T${String(endHour).padStart(2, "0")}:00:00+10:00`,
        timeZone: "Australia/Sydney",
      },
      status: "tentative",
      transparency: "opaque",
    },
  });

  return {
    id: event.data.id!,
    htmlLink: event.data.htmlLink ?? undefined,
  };
}

// Promote a tentative event to confirmed. Called when an enquiry's status flips
// to "confirmed" in the studio (via the Sanity webhook at
// /api/sanity/function-confirmed). Mirrors the manual step in build-spec §8.6:
// retag the summary "[TENTATIVE]" -> "[CONFIRMED]" so the booking reads as
// confirmed at a glance, and set the Google event status to "confirmed".
// Re-running on an already-confirmed event is a harmless no-op, which keeps the
// webhook idempotent under Sanity's retries.
export async function confirmCalendarEvent(eventId: string): Promise<void> {
  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_BOOKINGS_CALENDAR_ID!;

  const existing = await calendar.events.get({ calendarId, eventId });
  const summary = confirmedSummary(existing.data.summary ?? "");

  await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: { status: "confirmed", summary },
  });
}

// Remove an event from the Bookings calendar. Called when an enquiry's status
// flips to "lost" (build-spec §8.6 step 5). The caller treats a 404/410 (event
// already gone) as success so the webhook stays idempotent.
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const calendar = getCalendarClient();
  await calendar.events.delete({
    calendarId: process.env.GOOGLE_BOOKINGS_CALENDAR_ID!,
    eventId,
  });
}
