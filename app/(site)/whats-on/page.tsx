import type { Metadata } from "next";
import { sanityClient } from "@/lib/sanity/client";
import {
  upcomingEventsQuery,
  whatsOnQuery,
  openingHoursQuery,
} from "@/lib/sanity/queries";
import { EventCard } from "@/components/event/EventCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import type { SanityImageSource } from "@sanity/image-url";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "What's on",
  description:
    "Upcoming tournaments, league nights, and standing events at Beercade Redfern.",
};

interface Event {
  _id: string;
  title: string;
  slug: { current: string };
  kicker?: string | null;
  kind: string;
  startDate: string;
  endDate?: string | null;
  recurring?: string | null;
  entry?: string | null;
  prize?: string | null;
  status: "upcoming" | "live" | "wrapped" | "cancelled";
  hero?: (SanityImageSource & { alt?: string }) | null;
}

interface WhatsOn {
  _id: string;
  dayOfWeek: string;
  title: string;
  summary?: string | null;
}

const DAY_ORDER = ["Wed", "Thu", "Fri", "Sat", "Sun"];

export default async function WhatsOnPage() {
  const [events, standingNights] = await Promise.all([
    sanityClient.fetch<Event[]>(upcomingEventsQuery).catch(() => []),
    sanityClient.fetch<WhatsOn[]>(whatsOnQuery).catch(() => []),
  ]);

  const sorted = [...standingNights].sort(
    (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek)
  );

  return (
    <>
      <PageHeader kicker="Tournaments · league · standing nights" title="What's on." />

      <Section>
        {/* Upcoming events */}
        {events.length > 0 && (
          <section className="mb-20" aria-labelledby="upcoming-heading">
            <h2 id="upcoming-heading" className="t-kicker mb-6">
              Upcoming
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event._id} {...event} />
              ))}
            </div>
          </section>
        )}

        {/* Standing nights */}
        {sorted.length > 0 && (
          <section aria-labelledby="standing-heading">
            <h2 id="standing-heading" className="t-kicker mb-6">
              Every week
            </h2>
            <div className="flex flex-wrap gap-4">
              {sorted.map((night) => (
                <div
                  key={night._id}
                  className="min-w-50 flex-1 rounded-none border border-hairline bg-surface-raised p-5"
                >
                  <p className="t-kicker">{night.dayOfWeek}</p>
                  <p className="mt-3 t-h3 text-crema">{night.title}</p>
                  {night.summary && (
                    <p className="mt-2 font-body text-sm text-crema/60">
                      {night.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {events.length === 0 && sorted.length === 0 && (
          <p className="font-body text-crema/50">
            {/* PLACEHOLDER: shown before Sanity content is entered */}
            Nothing scheduled yet. Check back soon.
          </p>
        )}
      </Section>
    </>
  );
}
