import type { Metadata } from "next";
import { sanityClient } from "@/lib/sanity/client";
import { openingHoursQuery } from "@/lib/sanity/queries";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { MapEmbed } from "@/components/find-us/MapEmbed";
import { LocalBusinessJsonLd } from "@/components/seo/LocalBusinessJsonLd";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Find us",
  description:
    "113 Regent Street, Redfern NSW 2016. Two minutes from Redfern Station.",
};

interface DayHours {
  day: string;
  open?: string;
  close?: string;
  closed?: boolean;
}

interface OpeningHours {
  weeklyHours?: DayHours[];
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m === 0
    ? `${hour}${period}`
    : `${hour}:${String(m).padStart(2, "0")}${period}`;
}

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default async function FindUsPage() {
  const hours: OpeningHours | null = await sanityClient
    .fetch(openingHoursQuery)
    .catch(() => null);

  const sortedHours = hours?.weeklyHours
    ? [...hours.weeklyHours].sort(
        (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
      )
    : null;

  return (
    <>
      <LocalBusinessJsonLd openingHours={hours} />

      <PageHeader
        id="find-us-heading"
        kicker="113 Regent Street, Redfern NSW 2016"
        title="Find us."
      />

      {/* Transport + address detail */}
      <Section spacing="tight" aria-label="Getting here">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Train */}
          <div className="space-y-2">
            <h2 className="t-kicker">Train</h2>
            <p className="font-body text-base text-crema">
              Two minutes from Redfern Station. T2, T3, and T8 lines all stop
              there.
            </p>
          </div>

          {/* Bus */}
          <div className="space-y-2">
            <h2 className="t-kicker">Bus</h2>
            <p className="font-body text-base text-crema">
              Routes on Regent Street and Redfern Street stop within a
              two-minute walk.
            </p>
          </div>

          {/* Parking */}
          <div className="space-y-2">
            <h2 className="t-kicker">Parking</h2>
            <p className="font-body text-base text-crema">
              Street parking on Regent and surrounding streets. Limited on
              Friday and Saturday nights. The train is easier.
            </p>
          </div>
        </div>
      </Section>

      {/* Opening hours */}
      <Section spacing="tight" hairline aria-label="Opening hours">
        <h2 className="t-h2 mb-6 text-crema">Hours.</h2>
        {sortedHours ? (
            <dl className="max-w-sm divide-y divide-hairline">
              {sortedHours.map((row) => (
                <div
                  key={row.day}
                  className="flex items-baseline justify-between py-3"
                >
                  <dt className="font-body text-sm text-crema/60">{row.day}</dt>
                  <dd className="font-body text-sm text-crema">
                    {row.closed
                      ? "Closed"
                      : row.open && row.close
                        ? `${formatTime(row.open)} – ${formatTime(row.close)}`
                        : "—"}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <dl className="max-w-sm divide-y divide-hairline">
              {/* FILLME: opening hours — add via Sanity studio once connected */}
              {DAY_ORDER.map((day) => (
                <div
                  key={day}
                  className="flex items-baseline justify-between py-3"
                >
                  <dt className="font-body text-sm text-crema/60">{day}</dt>
                  <dd className="font-body text-sm text-crema/30">—</dd>
                </div>
              ))}
            </dl>
          )}
      </Section>

      {/* Accessibility */}
      <Section spacing="tight" hairline aria-label="Accessibility">
        <h2 className="t-h2 mb-3 text-crema">Access.</h2>
        {/* FILLME: step-free access details — confirm with venue operator before launch */}
      </Section>

      {/* Map */}
      <Section spacing="tight" hairline>
        <MapEmbed />
      </Section>
    </>
  );
}
