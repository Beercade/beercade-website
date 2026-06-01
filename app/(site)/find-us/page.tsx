import type { Metadata } from "next";
import { sanityClient } from "@/lib/sanity/client";
import { openingHoursQuery } from "@/lib/sanity/queries";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
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
      {/* Page header */}
      <section className="py-16 md:py-24" aria-labelledby="find-us-heading">
        <Container>
          <SectionHeading
            as="h1"
            kicker="113 Regent Street, Redfern NSW 2016"
          >
            <span id="find-us-heading">Find us.</span>
          </SectionHeading>
        </Container>
      </section>

      {/* Transport + address detail */}
      <section
        className="border-t border-tilt-purple/20 py-12"
        aria-label="Getting here"
      >
        <Container>
          <div className="grid gap-10 md:grid-cols-3">
            {/* Train */}
            <div className="space-y-2">
              <h2 className="font-accent text-xs uppercase tracking-widest text-high-score-orange">
                Train
              </h2>
              <p className="font-body text-base text-crema">
                Two minutes from Redfern Station. T2, T3, and T8 lines all
                stop there.
              </p>
            </div>

            {/* Bus */}
            <div className="space-y-2">
              <h2 className="font-accent text-xs uppercase tracking-widest text-high-score-orange">
                Bus
              </h2>
              <p className="font-body text-base text-crema">
                Routes on Regent Street and Redfern Street stop within a
                two-minute walk.
              </p>
            </div>

            {/* Parking */}
            <div className="space-y-2">
              <h2 className="font-accent text-xs uppercase tracking-widest text-high-score-orange">
                Parking
              </h2>
              <p className="font-body text-base text-crema">
                Street parking on Regent and surrounding streets. Limited on
                Friday and Saturday nights. The train is easier.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Opening hours */}
      <section
        className="border-t border-tilt-purple/20 py-12"
        aria-label="Opening hours"
      >
        <Container>
          <h2 className="mb-6 font-heading text-2xl font-bold text-crema">
            Hours.
          </h2>
          {sortedHours ? (
            <dl className="max-w-sm divide-y divide-tilt-purple/20">
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
            <dl className="max-w-sm divide-y divide-tilt-purple/20">
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
        </Container>
      </section>

      {/* Accessibility */}
      <section
        className="border-t border-tilt-purple/20 py-12"
        aria-label="Accessibility"
      >
        <Container>
          <h2 className="mb-3 font-heading text-2xl font-bold text-crema">
            Access.
          </h2>
          <p className="max-w-prose font-body text-base text-crema/70">
            {/* FILLME: step-free access details — confirm with venue operator before launch */}
          </p>
        </Container>
      </section>

      {/* Map */}
      <section className="border-t border-tilt-purple/20 py-12">
        <Container>
          <MapEmbed />
        </Container>
      </section>
    </>
  );
}
