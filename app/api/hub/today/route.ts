import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { listTodaysConfirmedFunctions } from "@/lib/google/calendar";
import { sanitiseSummary, type HubFunction } from "@/lib/google/hub-today";

// Today's confirmed functions for the staff hub's banner.
//
// The hub (hub.beercade.com.au, a separate static Vercel project) can't reach
// the Bookings calendar itself — the keyless GCP federation is bound to this
// project's OIDC tokens — so it asks the main site. The endpoint is public;
// customer names are stripped server-side and only start/end, pax, and
// occasion go out. Sanitisation lives in lib/google/hub-today.ts.

export const dynamic = "force-dynamic";

const ALLOWED_ORIGINS = [
  /^https:\/\/hub\.beercade\.com\.au$/,
  // beercade-hub preview deployments
  /^https:\/\/beercade-hub[\w.-]*\.vercel\.app$/,
];

function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    // The response is the same for everyone; let CDN caching absorb reloads.
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
    Vary: "Origin",
  };
  if (origin && ALLOWED_ORIGINS.some((re) => re.test(origin))) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
  }
  return headers;
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export async function GET(req: NextRequest) {
  const headers = corsHeaders(req.headers.get("origin"));

  try {
    const events = await listTodaysConfirmedFunctions();
    const functions: HubFunction[] = events.map((ev) => ({
      start: ev.start,
      end: ev.end,
      ...sanitiseSummary(ev.summary),
    }));
    return NextResponse.json({ functions }, { headers });
  } catch (err) {
    console.error("[hub-today] calendar read failed:", err);
    Sentry.captureException(err, { tags: { stage: "hub-today" } });
    return NextResponse.json(
      { error: "calendar read failed" },
      { status: 502, headers }
    );
  }
}
