import { sanityClient } from "@/lib/sanity/client";
import {
  homepageQuery,
  homepageTestimonialsQuery,
  openingHoursQuery,
} from "@/lib/sanity/queries";
import { HeroLoop } from "@/components/hero/HeroLoop";
import { MachineCard } from "@/components/machine/MachineCard";
import { EventCard } from "@/components/event/EventCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTAButton } from "@/components/ui/CTAButton";
import { Container } from "@/components/ui/Container";
import { ParallaxBackdrop } from "@/components/ui/ParallaxBackdrop";
import { MapEmbed } from "@/components/find-us/MapEmbed";
import { KitFormEmbed } from "@/components/newsletter/KitFormEmbed";
import dynamic from "next/dynamic";
import { LocalBusinessJsonLd } from "@/components/seo/LocalBusinessJsonLd";

const ExitIntentPopup = dynamic(
  () => import("@/components/newsletter/ExitIntentPopup").then((m) => m.ExitIntentPopup),
  { ssr: false }
);

export const revalidate = 60;

export default async function HomePage() {
  const [homepage, testimonials, openingHours] = await Promise.all([
    sanityClient.fetch(homepageQuery).catch(() => null),
    sanityClient.fetch(homepageTestimonialsQuery).catch(() => []),
    sanityClient.fetch(openingHoursQuery).catch(() => null),
  ]);

  return (
    <>
      <LocalBusinessJsonLd openingHours={openingHours} />
      {/* Hero */}
      <HeroLoop
        slides={homepage?.heroSlides}
        videoUrl={homepage?.heroVideoUrl}
        poster={homepage?.heroPoster}
        headline={homepage?.heroHeadline}
        subline={homepage?.heroSubline}
        ctaLabel={homepage?.primaryCtaLabel}
        ctaTarget={homepage?.primaryCtaTarget}
      />

      {/* Machines teaser — 6 featured */}
      {homepage?.featuredMachines?.length > 0 && (
        <>
        <ParallaxBackdrop image="/images/22A7540B-2514-4CCD-B2E7-C6F8B2E7D7F0.png" />
        <section className="py-20" aria-labelledby="machines-heading">
          <Container>
            <div className="mb-10 flex items-end justify-between gap-4">
              <SectionHeading as="h2">
                <span id="machines-heading">
                  {/* FILLME: in-voice machines section heading */}
                  The machines.
                </span>
              </SectionHeading>
              <CTAButton href="/machines" variant="ghost" className="shrink-0">
                See all
              </CTAButton>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {homepage.featuredMachines
                .slice(0, 6)
                .map(
                  (machine: {
                    _id: string;
                    name: string;
                    slug: { current: string };
                    type: string;
                    status: "working" | "maintenance" | "down";
                    photo: { alt?: string };
                  }) => (
                    <MachineCard key={machine._id} {...machine} />
                  )
                )}
            </div>
          </Container>
        </section>
        </>
      )}

      {/* What's on — 3 upcoming events */}
      {homepage?.featuredEvents?.length > 0 && (
        <>
        <ParallaxBackdrop image="/images/254BC9ED-D70C-44A4-B7AE-7CC00C58E59B.png" />
        <section className="bg-tilt-purple/10 py-20" aria-labelledby="events-heading">
          <Container>
            <div className="mb-10 flex items-end justify-between gap-4">
              <SectionHeading as="h2">
                <span id="events-heading">
                  {/* FILLME: in-voice events section heading */}
                  What&rsquo;s on.
                </span>
              </SectionHeading>
              <CTAButton href="/whats-on" variant="ghost" className="shrink-0">
                Full calendar
              </CTAButton>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {homepage.featuredEvents
                .slice(0, 3)
                .map(
                  (event: {
                    _id: string;
                    title: string;
                    slug: { current: string };
                    kicker?: string;
                    kind: string;
                    startDate: string;
                    status: "upcoming" | "live" | "wrapped" | "cancelled";
                    hero?: { alt?: string } | null;
                  }) => (
                    <EventCard key={event._id} {...event} />
                  )
                )}
            </div>
          </Container>
        </section>
        </>
      )}

      {/* Newsletter signup */}
      <section
        className="border-y border-tilt-purple/30 bg-last-train-purple py-16"
        aria-labelledby="newsletter-heading"
      >
        <Container>
          <div className="mx-auto max-w-xl text-center">
            <h2
              id="newsletter-heading"
              className="font-heading text-2xl font-bold text-crema md:text-3xl"
            >
              Thursday nights, tournament dates, new machines.
            </h2>
            <p className="mt-3 font-body text-base text-crema/70">
              {/* FILLME: in-voice newsletter pitch line */}
            </p>
            <div className="mt-6">
              <KitFormEmbed uid="68d090bd38" />
            </div>
          </div>
        </Container>
      </section>

      <ParallaxBackdrop image="/images/4D862F80-A335-45C0-8BB5-2EBDC22F8837.png" />

      {/* Function strip */}
      <section className="py-20" aria-labelledby="functions-heading">
        <Container>
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-16">
            <div className="flex-1 space-y-6">
              <SectionHeading as="h2" kicker="Book the room">
                <span id="functions-heading">
                  {/* FILLME: in-voice functions pitch headline */}
                  Your next function, sorted.
                </span>
              </SectionHeading>
              <p className="font-body text-lg text-crema/70">
                {/* FILLME: in-voice functions pitch body — one paragraph */}
              </p>
              {testimonials?.[0] && (
                <blockquote className="border-l-2 border-high-score-orange pl-4">
                  <p className="font-body text-base italic text-crema/80">
                    &ldquo;{testimonials[0].quote}&rdquo;
                  </p>
                  {testimonials[0].attribution && (
                    <footer className="mt-2 font-body text-sm text-crema/50">
                      — {testimonials[0].attribution}
                      {testimonials[0].context && (
                        <>, {testimonials[0].context}</>
                      )}
                    </footer>
                  )}
                </blockquote>
              )}
              <CTAButton href="/functions" variant="primary" className="text-sm">
                Book a function
              </CTAButton>
            </div>
          </div>
        </Container>
      </section>

      <ParallaxBackdrop image="/images/F4A1AF15-D276-4C98-8D5A-A7B26E859A3F.png" />

      {/* Find us strip */}
      <section className="relative border-t border-tilt-purple/30 bg-last-train-purple py-16" aria-labelledby="find-us-heading">
        <Container>
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
            <div>
              <h2
                id="find-us-heading"
                className="font-heading text-2xl font-bold text-crema md:text-3xl"
              >
                113 Regent Street, Redfern.
              </h2>
              <p className="mt-2 font-body text-base text-crema/70">
                Two minutes from Redfern Station. T2, T3 and T8 all stop there.
              </p>
              <div className="mt-6">
                <CTAButton href="/find-us" variant="secondary">
                  Find us
                </CTAButton>
              </div>
            </div>
            <MapEmbed height={300} className="border border-tilt-purple/20" />
          </div>
        </Container>
      </section>

      <ExitIntentPopup />
    </>
  );
}
