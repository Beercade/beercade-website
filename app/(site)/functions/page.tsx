import type { Metadata } from "next";

export const dynamic = "force-dynamic";

import { sanityClient } from "@/lib/sanity/client";
import {
  functionPackagesQuery,
  functionTestimonialsQuery,
} from "@/lib/sanity/queries";
import {
  FunctionPackageCard,
  type FunctionTier,
} from "@/components/function/FunctionPackageCard";
import { FunctionEnquiryForm } from "@/components/function/FunctionEnquiryForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Functions",
  description:
    "Book the room. Pinball, arcade machines, cold beer, private hire at Beercade Redfern from 8 people.",
};

interface Testimonial {
  _id: string;
  quote: string;
  attribution?: string | null;
  context?: string | null;
}

// Package tiers are authored in Sanity (studio → Function package). The page is
// just the framework; edit the content there. Fields map 1:1 to the card.
type PackageDoc = { _id: string } & Partial<FunctionTier> & {
    inclusions?: string[] | null;
  };

export default async function FunctionsPage() {
  const [packages, testimonials] = await Promise.all([
    sanityClient.fetch<PackageDoc[]>(functionPackagesQuery).catch(() => []),
    sanityClient.fetch<Testimonial[]>(functionTestimonialsQuery).catch(() => []),
  ]);

  return (
    <>
      <PageHeader
        kicker="Private hire"
        title="Book the room."
        lede="Three packages: one small, one standard, one big. Same spine every time, a held space, a drinks tab, machines on free play, and food, stepping up from there. Two to four weeks out is normal; midweek dates are easier to lock and the room's quieter for it."
      />

      {/* Packages — authored in Sanity (studio → Function package) */}
      <Section tone="raised" aria-labelledby="packages-heading">
        <h2 id="packages-heading" className="t-h2 text-crema">
          The packages.
        </h2>
        <p className="mt-3 max-w-2xl font-body text-crema/70">
          One small, one standard, one big, stepping up from the same spine.
        </p>

        {packages.length > 0 ? (
          <>
            <div
              className={`mt-10 grid items-start gap-6 ${
                packages.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"
              }`}
            >
              {packages.map((pkg) => (
                <FunctionPackageCard
                  key={pkg._id}
                  name={pkg.name ?? "Package"}
                  bestFor={pkg.bestFor ?? ""}
                  tagline={pkg.tagline ?? ""}
                  groupSize={pkg.groupSize ?? ""}
                  price={pkg.price ?? ""}
                  priceNote={pkg.priceNote ?? undefined}
                  youGet={pkg.inclusions ?? []}
                  toHold={pkg.toHold ?? ""}
                  pitch={pkg.pitch ?? ""}
                  featured={pkg.featured ?? false}
                />
              ))}
            </div>

            {/* The promise that runs the floor */}
            <p className="mt-10 max-w-2xl border-l-2 border-high-score-orange pl-4 font-body text-sm text-crema/70">
              Every package carries the same promise that runs the floor: if a
              machine won&rsquo;t behave on your night, tell the bar. We fix it
              in five minutes or refund the credit.
            </p>
          </>
        ) : (
          <p className="mt-6 font-body text-crema/50">
            {/* PLACEHOLDER: shown until Function package docs are added in Sanity */}
            Packages are being finalised. Email{" "}
            <a
              href="mailto:functions@beercade.com.au"
              className="text-high-score-orange underline underline-offset-4 decoration-hairline transition-colors hover:decoration-high-score-orange"
            >
              functions@beercade.com.au
            </a>{" "}
            and we&rsquo;ll talk you through the options.
          </p>
        )}
      </Section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <Section hairline aria-labelledby="testimonials-heading">
          <h2 id="testimonials-heading" className="t-h2 mb-8 text-crema">
            What groups say.
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote
                key={t._id}
                className="rounded-none border border-hairline bg-surface-raised p-6"
              >
                <p className="font-body text-base italic text-crema/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
                {t.attribution && (
                  <footer className="mt-3 font-body text-sm text-crema/50">
                    — {t.attribution}
                    {t.context && <>, {t.context}</>}
                  </footer>
                )}
              </blockquote>
            ))}
          </div>
        </Section>
      )}

      {/* Enquiry */}
      <Section hairline aria-labelledby="enquire-heading">
        <div className="grid gap-12 md:grid-cols-[1fr_560px]">
          <div className="space-y-4">
            <h2 id="enquire-heading" className="t-h2 text-crema">
              Get in touch.
            </h2>
            <p className="font-body text-crema/70">
              Tell us your date, rough headcount, and the occasion. You&rsquo;ll
              get a real reply with a held window and the full breakdown, not a
              form letter; normally within 24 hours.
            </p>
            <p className="font-body text-sm text-crema/60">
              Prefer email? Reach us at{" "}
              <a
                href="mailto:functions@beercade.com.au"
                className="text-high-score-orange underline underline-offset-4 decoration-hairline transition-colors hover:decoration-high-score-orange"
              >
                functions@beercade.com.au
              </a>
              .
            </p>
          </div>
          <FunctionEnquiryForm />
        </div>
      </Section>
    </>
  );
}
