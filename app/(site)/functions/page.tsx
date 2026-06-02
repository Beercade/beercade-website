import type { Metadata } from "next";

export const dynamic = "force-dynamic";

import { sanityClient } from "@/lib/sanity/client";
import { functionTestimonialsQuery } from "@/lib/sanity/queries";
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

// Three tiers, built so the middle one is the obvious pick. Anything in
// [square brackets] is unconfirmed (deposits, notice windows, capacity ceiling,
// whole-venue minimum spend, food specifics) — FILLME: confirm with Roger and
// replace before launch.
const PACKAGES: FunctionTier[] = [
  {
    name: "The Long Pour",
    bestFor: "Post-work · small birthdays",
    tagline:
      "A reserved corner, a tab, and the machines warmed up. For when it's a handful of you and you can't be bothered organising more than that.",
    groupSize: "8–15",
    price: "$35 / head",
    priceNote: "minimum 8 people",
    youGet: [
      "A reserved cluster of tables near the machines, held for your group all night.",
      "A 3-hour drinks tab to a limit you set up front; when it's reached, the bar reverts to normal service.",
      "Three machines of your choice on free play.",
      "One starter platter to share on arrival.",
    ],
    toHold: "1 week's notice. Deposit $[XX], applied to your final bill.",
    pitch:
      "The walk-in night, but the good table's already yours and the first round's sorted.",
  },
  {
    name: "The Back Room",
    bestFor: "Birthdays · team nights",
    tagline:
      "Four pinball tables and the Daytona twin-seater in one space, so nobody's queuing for one machine while everyone else drinks.",
    groupSize: "15–30",
    price: "$48 / head",
    priceNote: "a group of 18 lands at roughly $864 all in",
    youGet: [
      "Exclusive use of the back room (four pinball tables and the Daytona twin-seater) from open.",
      "A 4-hour drinks tab to a limit you set.",
      "Every machine in the back room on free play all night.",
      "A starter platter on arrival, plus a second feed mid-session [confirm menu].",
      "A held window emailed to you in writing, with the full breakdown, before you commit.",
    ],
    toHold: "2–4 weeks' notice. Deposit $[XXX], applied to your final bill.",
    pitch:
      "Your own room, your own machines, four hours, one number; and it survives the forward to your boss.",
    featured: true,
  },
  {
    name: "The Lock-In",
    bestFor: "Company parties · milestones",
    tagline:
      "The whole place, or near enough. A host runs a pinball bracket, the HI SCORE board goes up, and the Godzilla LE gets held for the final.",
    groupSize: "30 to whole-venue",
    price: "From $[X,XXX] min spend",
    priceNote: "lower midweek than Friday or Saturday",
    youGet: [
      "Whole-venue hire, or the back room plus the main floor [confirm by night].",
      "An extended drinks tab or a full beverage package, your call.",
      "Every machine in the building on free play.",
      "A full food spread [confirm the spread].",
      "A Pinball Night host running a knockout tournament, with a printed HI SCORE board and the Godzilla LE held for the final.",
    ],
    toHold: "3–4 weeks' notice. Deposit $[XXX].",
    pitch:
      "The night people text about the next morning. No costume, no velvet rope.",
  },
];

export default async function FunctionsPage() {
  const testimonials = await sanityClient
    .fetch<Testimonial[]>(functionTestimonialsQuery)
    .catch(() => []);

  return (
    <>
      <PageHeader
        kicker="Private hire"
        title="Book the room."
        lede="Three packages: one small, one standard, one big. Same spine every time, a held space, a drinks tab, machines on free play, and food, stepping up from there. Two to four weeks out is normal; midweek dates are easier to lock and the room's quieter for it."
      />

      {/* Packages */}
      <Section tone="raised" aria-labelledby="packages-heading">
        <h2 id="packages-heading" className="t-h2 text-crema">
          The packages.
        </h2>
        <p className="mt-3 max-w-2xl font-body text-crema/70">
          One small, one standard, one big, stepping up from the same spine.
        </p>

        <div className="mt-10 grid items-start gap-6 md:grid-cols-3">
          {PACKAGES.map((pkg) => (
            <FunctionPackageCard key={pkg.name} {...pkg} />
          ))}
        </div>

        {/* The promise that runs the floor */}
        <p className="mt-10 max-w-2xl border-l-2 border-high-score-orange pl-4 font-body text-sm text-crema/70">
          Every package carries the same promise that runs the floor: if a
          machine won&rsquo;t behave on your night, tell the bar. We fix it in
          five minutes or refund the credit.
        </p>
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
