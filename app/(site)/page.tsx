import { sanityClient } from "@/lib/sanity/client";
import {
  homepageQuery,
  homepageTestimonialsQuery,
  machineCountQuery,
  openingHoursQuery,
} from "@/lib/sanity/queries";
import { Marquee } from "@/components/ui/Marquee";
import { HeroLoop } from "@/components/hero/HeroLoop";
import { MachineCard } from "@/components/machine/MachineCard";
import { EventCard } from "@/components/event/EventCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTAButton } from "@/components/ui/CTAButton";
import { Section } from "@/components/ui/Section";
import { FeatureImage } from "@/components/ui/FeatureImage";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { MapEmbed } from "@/components/find-us/MapEmbed";
import dynamic from "next/dynamic";
import { LocalBusinessJsonLd } from "@/components/seo/LocalBusinessJsonLd";
import { FaqList } from "@/components/faq/Faq";
import { visiting } from "@/components/faq/data";

const ExitIntentPopup = dynamic(
  () => import("@/components/newsletter/ExitIntentPopup").then((m) => m.ExitIntentPopup),
  { ssr: false }
);

export const revalidate = 60;

export default async function HomePage() {
  const [homepage, testimonials, openingHours, machineCount] =
    await Promise.all([
      sanityClient.fetch(homepageQuery).catch(() => null),
      sanityClient.fetch(homepageTestimonialsQuery).catch(() => []),
      sanityClient.fetch(openingHoursQuery).catch(() => null),
      sanityClient.fetch<number>(machineCountQuery).catch(() => 0),
    ]);

  const featuredMachines = (homepage?.featuredMachines ?? []).slice(0, 6);
  // Column count tracks the actual number of machines so a part-filled lineup
  // (e.g. 3 of a possible 6) fills the row at a readable card size, rather than
  // cramming into narrow tracks pushed to the left. Capped at 3-up to match the
  // card's own image `sizes` and the What's-on grid below.
  const machineColumns =
    featuredMachines.length <= 1
      ? "grid-cols-1 max-w-sm"
      : featuredMachines.length === 2
        ? "grid-cols-2 max-w-2xl"
        : "grid-cols-2 sm:grid-cols-3";

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

      {/* Stat strip — hierarchy through scale, not decoration (brand §6).
          All three are established facts: the live machine count, the $2 play
          price from the functions page, the station walk from find-us.
          Stats signed off by John 11 Jun 2026. */}
      <Section tone="raised" spacing="tight" aria-label="The numbers">
        <dl className="grid grid-cols-3 gap-6 text-center md:gap-10">
          {machineCount > 0 && (
            <div className="flex flex-col-reverse gap-3">
              <dt className="t-arcade text-crema/50">machines</dt>
              <dd className="t-numeral text-crema">{machineCount}</dd>
            </div>
          )}
          <div className="flex flex-col-reverse gap-3">
            <dt className="t-arcade text-crema/50">a play</dt>
            <dd className="t-numeral text-crema">$2</dd>
          </div>
          <div className="flex flex-col-reverse gap-3">
            <dt className="t-arcade text-crema/50">from the train</dt>
            <dd className="t-numeral text-crema">2 min</dd>
          </div>
        </dl>
      </Section>

      {/* Machines teaser — up to 6 featured */}
      {featuredMachines.length > 0 && (
        <Section tone="default" aria-labelledby="machines-heading">
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
          <div className={`grid gap-4 ${machineColumns}`}>
            {featuredMachines.map(
              (machine: {
                _id: string;
                name: string;
                slug: { current: string };
                type: string;
                status: "working" | "maintenance" | "down";
                photo: { alt?: string };
                logoBackground?: "light" | "dark" | null;
              }) => (
                <MachineCard key={machine._id} {...machine} />
              )
            )}
          </div>
        </Section>
      )}

      {/* Establishing venue shot — used once (brand §7) */}
      <FeatureImage src="/images/venue-floor-pinball-row.jpg" />

      {/* What's on — 3 upcoming events */}
      {homepage?.featuredEvents?.length > 0 && (
        <Section tone="raised" hairline aria-labelledby="events-heading">
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
        </Section>
      )}

      {/* Functions — High Score Orange feature block (Combination B) for contrast/energy */}
      <Section tone="feature-orange" aria-labelledby="functions-heading">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-16">
          <div className="space-y-6">
            <p className="t-kicker text-after-dark/70">Book the room</p>
            <h2 id="functions-heading" className="t-display text-after-dark text-balance">
              {/* FILLME: in-voice functions pitch headline */}
              Your next function, sorted.
            </h2>
            {/* FILLME: in-voice functions pitch body — one paragraph */}
            {testimonials?.[0] && (
              <blockquote className="border-l-2 border-after-dark pl-4">
                <p className="font-body text-base italic text-after-dark/80">
                  &ldquo;{testimonials[0].quote}&rdquo;
                </p>
                {testimonials[0].attribution && (
                  <footer className="mt-2 font-body text-sm text-after-dark/60">
                    — {testimonials[0].attribution}
                    {testimonials[0].context && <>, {testimonials[0].context}</>}
                  </footer>
                )}
              </blockquote>
            )}
            <CTAButton href="/functions" variant="secondary" className="border-after-dark text-after-dark hover:bg-after-dark hover:text-crema">
              Book a function
            </CTAButton>
          </div>
        </div>
      </Section>

      {/* FAQ teaser — first three questions, link to the full page */}
      <Section tone="default" hairline aria-labelledby="faq-heading">
        <div className="mb-10 flex items-end justify-between gap-4">
          <SectionHeading as="h2">
            <span id="faq-heading">Good to know.</span>
          </SectionHeading>
          <CTAButton href="/faq" variant="ghost" className="shrink-0">
            All questions
          </CTAButton>
        </div>
        <FaqList items={visiting.slice(0, 3)} />
      </Section>

      {/* Newsletter signup */}
      <Section tone="raised" hairline aria-labelledby="newsletter-heading">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <p className="t-kicker mb-3">The list</p>
            <h2 id="newsletter-heading" className="t-h2 text-crema text-balance">
              Know what&rsquo;s on before the regulars do.
            </h2>
            <p className="mt-3 max-w-prose font-body text-base text-crema">
              Sign up and grab a free beer on your next visit.
            </p>
            <p className="mt-2 max-w-prose font-body text-base text-crema/70">
              After that, one email when a new machine lands on the floor, a
              tournament date drops, or a midweek night&rsquo;s worth the train
              in. No spam; unsubscribe whenever.
            </p>
            {/* FILLME: confirm the final promo terms with Liquor &amp; Gaming
                NSW before launch — validity window, any purchase condition, and
                which drink qualifies. Keep it RSA-compliant. */}
            <p className="mt-4 max-w-prose font-body text-xs text-crema/50">
              One complimentary house beer or non-alcoholic drink per new
              subscriber, 18+, redeemable on your next visit within{" "}
              <span className="text-crema/40" title="To confirm before launch">
                [30 days]
              </span>{" "}
              of signing up. One per person. Served responsibly; staff may
              refuse service.
            </p>
          </div>
          <div className="w-full">
            <NewsletterSignup source="footer" />
          </div>
        </div>
      </Section>

      {/* Find us */}
      <Section tone="default" hairline aria-labelledby="find-us-heading">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <p className="t-kicker mb-4">Redfern</p>
            <h2 id="find-us-heading" className="t-h2 text-crema text-balance">
              113-115 Regent Street, Redfern.
            </h2>
            <p className="mt-3 font-body text-base text-crema/70">
              Two minutes from Redfern Station. T2, T3 and T8 all stop there.
            </p>
            <div className="mt-6">
              <CTAButton href="/find-us" variant="secondary">
                Find us
              </CTAButton>
            </div>
          </div>
          <MapEmbed height={320} className="border border-hairline" />
        </div>
      </Section>

      {/* Deadpan ticker — lines from the brand vocabulary list (§9.3),
          signed off by John 11 Jun 2026. */}
      <Marquee
        lines={[
          "You’ll lose. That’s fine.",
          "Real pinball.",
          "Two minutes from the train.",
          "Midweek’s worth the train in.",
        ]}
      />

      <ExitIntentPopup />
    </>
  );
}
