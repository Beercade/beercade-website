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

        {/* Standing nights — a Wed→Sun week strip so "what night should I
            come" is answerable at a glance. Horizontal snap rail on mobile,
            five columns from sm up. */}
        {sorted.length > 0 && (
          <section aria-labelledby="standing-heading">
            <h2 id="standing-heading" className="t-kicker mb-6">
              Every week
            </h2>
            <div className="-mx-(--grid-gutter-mobile) flex snap-x snap-mandatory gap-3 overflow-x-auto px-(--grid-gutter-mobile) pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0">
              {DAY_ORDER.map((day) => {
                const nights = sorted.filter((n) => n.dayOfWeek === day);
                const hasNight = nights.length > 0;
                return (
                  <div
                    key={day}
                    className={`min-w-56 shrink-0 snap-start rounded-none border p-5 sm:min-w-0 sm:shrink ${
                      hasNight
                        ? "border-hairline bg-surface-raised"
                        : "border-hairline/40"
                    }`}
                  >
                    <p className="t-kicker">{day}</p>
                    {hasNight ? (
                      nights.map((night) => (
                        <div key={night._id}>
                          <p className="t-h3 mt-3 text-crema">{night.title}</p>
                          {night.summary && (
                            <p className="mt-2 font-body text-sm text-crema/60">
                              {night.summary}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p
                        className="mt-3 font-body text-sm text-crema/30"
                        aria-label="No standing night"
                      >
                        &mdash;
                      </p>
                    )}
                  </div>
                );
              })}
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
