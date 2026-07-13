// Pure helpers for the staff-hub banner endpoint (app/api/hub/today).
// Kept free of the Google client so they can be unit-tested.

const SYDNEY_TZ = "Australia/Sydney";

// The hub's banner only needs the shape of the night, never the customer.
export interface HubFunction {
  start: string;
  end: string;
  pax: number | null;
  occasion: string | null;
}

// RFC3339 bounds for "today" in Sydney regardless of server timezone. Uses the
// current UTC offset for both bounds; on the two DST changeover days a year the
// edges skew by an hour, which cannot matter for an evening-functions banner.
export function sydneyDayBounds(now: Date = new Date()): {
  timeMin: string;
  timeMax: string;
} {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: SYDNEY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const offset = sydneyOffset(now);
  return {
    timeMin: `${ymd}T00:00:00${offset}`,
    timeMax: `${ymd}T23:59:59${offset}`,
  };
}

function sydneyOffset(now: Date): string {
  const tzName =
    new Intl.DateTimeFormat("en-AU", {
      timeZone: SYDNEY_TZ,
      timeZoneName: "longOffset",
    })
      .formatToParts(now)
      .find((p) => p.type === "timeZoneName")?.value ?? "";
  return tzName.match(/([+-]\d{2}:\d{2})/)?.[1] ?? "+10:00";
}

// Bookings summaries look like "[CONFIRMED] Jane Citizen · 40 pax · 30th".
// Strip the status tag, pull out pax and the occasion, and drop the name —
// the endpoint is public, so the customer's name must not leave the server.
export function sanitiseSummary(summary: string): {
  pax: number | null;
  occasion: string | null;
} {
  const base = summary.replace(/^\s*\[(TENTATIVE|CONFIRMED)\]\s*/i, "").trim();
  const pax = base.match(/(\d+)\s*pax/i);
  const segments = base
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);
  // Only trust the occasion when the summary follows the three-part site
  // format; a hand-typed summary could put the name anywhere.
  const occasion = segments.length >= 3 ? segments[segments.length - 1] : null;
  return { pax: pax ? Number(pax[1]) : null, occasion };
}
