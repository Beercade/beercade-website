import type { Metadata } from "next";

export const dynamic = "force-dynamic";

import { sanityClient } from "@/lib/sanity/client";
import {
  functionsPageQuery,
  functionTestimonialsQuery,
} from "@/lib/sanity/queries";
import { FunctionEnquiryFlow } from "@/components/function/FunctionEnquiryFlow";
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

interface TokenOption {
  _key: string;
  heading: string;
  description?: string | null;
  mostPopular?: boolean | null;
}
interface BulkRow {
  _key: string;
  spend: string;
  tokens: string;
}
interface Rule {
  _key: string;
  label: string;
  body?: string | null;
}
interface DeliveryPlace {
  _key: string;
  name: string;
  url?: string | null;
  note?: string | null;
}
interface FunctionsPage {
  kicker?: string | null;
  title?: string | null;
  lede?: string | null;
  contactHeading?: string | null;
  contactIntro?: string | null;
  contactEmail?: string | null;
  contactPhoneName?: string | null;
  contactPhoneDisplay?: string | null;
  contactPhoneHref?: string | null;
  tokensHeading?: string | null;
  tokensIntro?: string | null;
  tokenOptions?: TokenOption[] | null;
  bulkHeading?: string | null;
  bulkRows?: BulkRow[] | null;
  bulkNote?: string | null;
  rules?: Rule[] | null;
  licensedNote?: string | null;
  foodIntro?: string | null;
  deliveryPlaces?: DeliveryPlace[] | null;
  hoursNormallyOpen?: string | null;
  hoursAvailableForFunctions?: string | null;
  freeHireNote?: string | null;
}

export default async function FunctionsPage() {
  const [page, testimonials] = await Promise.all([
    sanityClient.fetch<FunctionsPage | null>(functionsPageQuery).catch(() => null),
    sanityClient
      .fetch<Testimonial[]>(functionTestimonialsQuery)
      .catch(() => []),
  ]);

  const linkClass =
    "text-high-score-orange underline underline-offset-4 decoration-hairline transition-colors hover:decoration-high-score-orange";

  const tokenOptions = page?.tokenOptions ?? [];
  const bulkRows = page?.bulkRows ?? [];
  const rules = page?.rules ?? [];
  const deliveryPlaces = page?.deliveryPlaces ?? [];

  return (
    <>
      <PageHeader
        kicker={page?.kicker ?? undefined}
        title={page?.title ?? "Book the room."}
        lede={page?.lede ?? undefined}
      />

      {/* Enquiry — first thing under the heading */}
      <Section id="enquire" hairline aria-labelledby="enquire-heading">
        <div className="grid gap-12 md:grid-cols-[1fr_560px]">
          <div className="space-y-4">
            <h2 id="enquire-heading" className="t-h2 text-crema">
              {page?.contactHeading ?? "Get in touch."}
            </h2>
            {page?.contactIntro && (
              <p className="font-body text-crema/70">{page.contactIntro}</p>
            )}
            {page?.contactEmail && (
              <p className="font-body text-crema/60 text-sm">
                Prefer email? Reach us at{" "}
                <a href={`mailto:${page.contactEmail}`} className={linkClass}>
                  {page.contactEmail}
                </a>
                .
              </p>
            )}
            {page?.contactPhoneDisplay && (
              <p className="font-body text-crema/60 text-sm">
                Prefer to talk? Call{" "}
                {page.contactPhoneName ? `${page.contactPhoneName} on ` : ""}
                <a
                  href={`tel:${page.contactPhoneHref ?? page.contactPhoneDisplay.replace(/\s/g, "")}`}
                  className={linkClass}
                >
                  {page.contactPhoneDisplay}
                </a>
                .
              </p>
            )}
          </div>
          <FunctionEnquiryFlow />
        </div>
      </Section>

      {/* Tokens and drinks — the mechanics behind every package */}
      {(page?.tokensHeading || tokenOptions.length > 0) && (
        <Section hairline aria-labelledby="tokens-heading">
          <h2 id="tokens-heading" className="t-h2 text-crema">
            {page?.tokensHeading ?? "Tokens and drinks."}
          </h2>
          {page?.tokensIntro && (
            <p className="font-body text-crema/70 mt-3 max-w-2xl">
              {page.tokensIntro}
            </p>
          )}

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-start">
            {tokenOptions.length > 0 && (
              <ul
                className="space-y-3"
                aria-label="Per-head token and drink options"
              >
                {tokenOptions.map((opt) => (
                  <li
                    key={opt._key}
                    className={
                      opt.mostPopular
                        ? "border-high-score-orange bg-surface-raised flex flex-col gap-1 border-l-2 p-4"
                        : "border-hairline flex flex-col gap-1 border p-4"
                    }
                  >
                    <span className="font-body text-crema text-sm font-semibold">
                      {opt.heading}
                      {opt.mostPopular && (
                        <>
                          {" "}
                          <span className="text-high-score-orange font-normal tracking-wider uppercase">
                            Most popular
                          </span>
                        </>
                      )}
                    </span>
                    {opt.description && (
                      <span className="font-body text-crema/70 text-sm">
                        {opt.description}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {bulkRows.length > 0 && (
              <div>
                {page?.bulkHeading && (
                  <p className="t-kicker mb-3">{page.bulkHeading}</p>
                )}
                <table className="font-body w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-hairline text-crema/50 border-b">
                      <th
                        scope="col"
                        className="py-2 text-left text-xs font-medium tracking-widest uppercase"
                      >
                        Spend
                      </th>
                      <th
                        scope="col"
                        className="py-2 text-right text-xs font-medium tracking-widest uppercase"
                      >
                        Tokens
                      </th>
                    </tr>
                  </thead>
                  {/* Token counts in the Press Start accent — the brand §8
                      HI-SCORE numeral device, used for numerals only. */}
                  <tbody className="text-crema/85">
                    {bulkRows.map((row, i) => (
                      <tr
                        key={row._key}
                        className={
                          i < bulkRows.length - 1
                            ? "border-hairline/60 border-b"
                            : undefined
                        }
                      >
                        <td className="py-2.5">{row.spend}</td>
                        <td className="font-accent text-high-score-orange py-2.5 text-right text-xs">
                          {row.tokens}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {page?.bulkNote && (
                  <p className="font-body text-crema/50 mt-3 text-xs">
                    {page.bulkNote}
                  </p>
                )}
              </div>
            )}
          </div>

          {rules.length > 0 && (
            <div className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
              {rules.map((rule) => (
                <p key={rule._key} className="font-body text-crema/70 text-sm">
                  <span className="text-crema font-semibold">{rule.label}</span>
                  {rule.body && <> {rule.body}</>}
                </p>
              ))}
            </div>
          )}

          {page?.licensedNote && (
            <p className="font-body text-crema/60 mt-6 max-w-2xl text-sm">
              {page.licensedNote}
            </p>
          )}
        </Section>
      )}

      {/* Food and hours */}
      {(page?.foodIntro || page?.hoursNormallyOpen) && (
        <Section tone="raised" hairline aria-labelledby="food-hours-heading">
          <h2 id="food-hours-heading" className="sr-only">
            Food and hours
          </h2>
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <p className="t-kicker mb-3">Food</p>
              {page?.foodIntro && (
                <p className="font-body text-crema/70 max-w-prose">
                  {page.foodIntro}
                </p>
              )}
              {deliveryPlaces.length > 0 && (
                <ul className="font-body text-crema/80 mt-4 space-y-2 text-sm">
                  {deliveryPlaces.map((place) => (
                    <li key={place._key}>
                      {place.url ? (
                        <a
                          href={place.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={linkClass}
                        >
                          {place.name}
                        </a>
                      ) : (
                        place.name
                      )}
                      {place.note && <> · {place.note}</>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="t-kicker mb-3">Hours</p>
              <dl className="font-body text-crema/80 space-y-4">
                {page?.hoursNormallyOpen && (
                  <div>
                    <dt className="text-crema/50 text-xs tracking-widest uppercase">
                      Normally open
                    </dt>
                    <dd className="mt-1">{page.hoursNormallyOpen}</dd>
                  </div>
                )}
                {page?.hoursAvailableForFunctions && (
                  <div>
                    <dt className="text-crema/50 text-xs tracking-widest uppercase">
                      Available for functions
                    </dt>
                    <dd className="mt-1">{page.hoursAvailableForFunctions}</dd>
                  </div>
                )}
              </dl>
              {page?.freeHireNote && (
                <p className="font-body text-crema/60 mt-4 max-w-prose text-sm">
                  {page.freeHireNote}
                </p>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <Section hairline aria-labelledby="testimonials-heading">
          <h2 id="testimonials-heading" className="t-h2 text-crema mb-8">
            What groups say.
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote
                key={t._id}
                className="border-hairline bg-surface-raised rounded-none border p-6"
              >
                <p className="font-body text-crema/80 text-base italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                {t.attribution && (
                  <footer className="font-body text-crema/50 mt-3 text-sm">
                    — {t.attribution}
                    {t.context && <>, {t.context}</>}
                  </footer>
                )}
              </blockquote>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
