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

  const linkClass =
    "text-high-score-orange underline underline-offset-4 decoration-hairline transition-colors hover:decoration-high-score-orange";

  return (
    <>
      <PageHeader
        kicker="Private hire"
        title="Book the room."
        lede="Three ways to do it, one spine: a held room, a bag of tokens per guest, drinks sorted, and food ordered in. Holding the room is usually free; a weekday daytime, or any slot outside our normal trading, costs nothing. The only time you pay to hire is closing a trading night to your group, at $750 an hour. Tokens you don't burn go home with you; drink tickets are spent on the night."
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

      {/* Tokens and drinks — the mechanics behind every package */}
      <Section hairline aria-labelledby="tokens-heading">
        <h2 id="tokens-heading" className="t-h2 text-crema">
          Tokens and drinks.
        </h2>
        <p className="mt-3 max-w-2xl font-body text-crema/70">
          The machines run on tokens; most games are $2, or two tokens a play.
          Every guest gets a bag of tokens and drink tickets. Here are the
          per-head packages, most popular first.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-start">
          <ul
            className="space-y-3"
            aria-label="Per-head token and drink options"
          >
            <li className="flex flex-col gap-1 border-l-2 border-high-score-orange bg-surface-raised p-4">
              <span className="font-body text-sm font-semibold text-crema">
                Option 1 · $50pp{" "}
                <span className="font-normal uppercase tracking-wider text-high-score-orange">
                  Most popular
                </span>
              </span>
              <span className="font-body text-sm text-crema/70">
                25 tokens and 2 drink tickets.
              </span>
            </li>
            <li className="flex flex-col gap-1 border border-hairline p-4">
              <span className="font-body text-sm font-semibold text-crema">
                Option 2 · $50pp
              </span>
              <span className="font-body text-sm text-crema/70">
                60 tokens, no drinks; guests buy their own at the bar.
              </span>
            </li>
            <li className="flex flex-col gap-1 border border-hairline p-4">
              <span className="font-body text-sm font-semibold text-crema">
                Option 3 · $60pp
              </span>
              <span className="font-body text-sm text-crema/70">
                35 tokens and 3 drink tickets.
              </span>
            </li>
            <li className="flex flex-col gap-1 border border-hairline p-4">
              <span className="font-body text-sm font-semibold text-crema">
                Option 4 · bulk tokens
              </span>
              <span className="font-body text-sm text-crema/70">
                Buy in one lump and let guests help themselves.
              </span>
            </li>
          </ul>

          <div>
            <p className="t-kicker mb-3">Buy tokens in bulk</p>
            <table className="w-full border-collapse font-body text-sm">
              <thead>
                <tr className="border-b border-hairline text-crema/50">
                  <th
                    scope="col"
                    className="py-2 text-left text-xs font-medium uppercase tracking-widest"
                  >
                    Spend
                  </th>
                  <th
                    scope="col"
                    className="py-2 text-right text-xs font-medium uppercase tracking-widest"
                  >
                    Tokens
                  </th>
                </tr>
              </thead>
              <tbody className="text-crema/85">
                <tr className="border-b border-hairline/60">
                  <td className="py-2">$100</td>
                  <td className="py-2 text-right">125</td>
                </tr>
                <tr className="border-b border-hairline/60">
                  <td className="py-2">$200</td>
                  <td className="py-2 text-right">260</td>
                </tr>
                <tr className="border-b border-hairline/60">
                  <td className="py-2">$300</td>
                  <td className="py-2 text-right">450</td>
                </tr>
                <tr>
                  <td className="py-2">$500</td>
                  <td className="py-2 text-right">850</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-3 font-body text-xs text-crema/50">
              Buying in bulk on the day saves more again, and whatever’s left
              over is yours to keep.
            </p>
          </div>
        </div>

        <div className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
          <p className="font-body text-sm text-crema/70">
            <span className="font-semibold text-crema">
              Tokens never expire.
            </span>{" "}
            Don’t burn them all on the night; take the leftovers home and use
            them whenever. They can’t be cashed out or swapped for drinks, but
            they keep forever.
          </p>
          <p className="font-body text-sm text-crema/70">
            <span className="font-semibold text-crema">
              Drink tickets are spent on the night.
            </span>{" "}
            One ticket gets any drink except cocktails, which are two. They
            can’t be swapped for cash or tokens, and they expire the second your
            function ends. Tell your guests; they’ll try.
          </p>
        </div>

        <p className="mt-6 max-w-2xl font-body text-sm text-crema/60">
          We’re fully licensed. Under-18s are welcome as long as they’re with a
          responsible adult, family or guardian.
        </p>
      </Section>

      {/* Food and hours */}
      <Section tone="raised" hairline aria-labelledby="food-hours-heading">
        <h2 id="food-hours-heading" className="sr-only">
          Food and hours
        </h2>
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <p className="t-kicker mb-3">Food</p>
            <p className="max-w-prose font-body text-crema/70">
              The bar does small snacks; toasties and a range of chips. For
              anything more, bring your own or order in. Plenty of our
              neighbours deliver straight to us, and we’ll pass on their details
              so you can place the order yourself for the day.
            </p>
            <ul className="mt-4 space-y-2 font-body text-sm text-crema/80">
              <li>
                <a
                  href="https://www.lacoppola.com.au"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  La Coppola
                </a>{" "}
                · great pizza
              </li>
              <li>
                <a
                  href="https://www.huxtaburger.com.au"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Huxtaburger
                </a>{" "}
                · burgers and sliders
              </li>
              <li>
                <a
                  href="https://www.bigdaddiesburgerbar.com.au"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Big Daddies Burger Bar
                </a>{" "}
                · American-style burgers
              </li>
              <li>Sushi Topia, Redfern · order through Uber Eats</li>
              <li>
                <a
                  href="https://www.rararamen.com.au"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Rara Ramen
                </a>{" "}
                · vegetarian, and properly good
              </li>
            </ul>
          </div>
          <div>
            <p className="t-kicker mb-3">Hours</p>
            <dl className="space-y-4 font-body text-crema/80">
              <div>
                <dt className="text-xs uppercase tracking-widest text-crema/50">
                  Normally open
                </dt>
                <dd className="mt-1">Wed to Sat, 3pm to midnight. Sun, 3pm to 10pm.</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-crema/50">
                  Available for functions
                </dt>
                <dd className="mt-1">Mon to Sat, 10am to midnight. Sun, 10am to 10pm.</dd>
              </div>
            </dl>
            <p className="mt-4 max-w-prose font-body text-sm text-crema/60">
              The gap between those two is where the free hire lives. A weekday
              daytime, a Monday or Tuesday, costs nothing to hold.
            </p>
          </div>
        </div>
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
              <a href="mailto:functions@beercade.com.au" className={linkClass}>
                functions@beercade.com.au
              </a>
              .
            </p>
            <p className="font-body text-sm text-crema/60">
              Prefer to talk? Call Roger on{" "}
              <a href="tel:+61400112445" className={linkClass}>
                0400 112 445
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
