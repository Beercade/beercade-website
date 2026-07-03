import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqList } from "@/components/faq/Faq";
import { visiting, functions } from "@/components/faq/data";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Where Beercade is, when we're open, what it costs to play, and how to book the room for a function. Redfern NSW, two minutes from the station.",
};

export default function FaqPage() {
  return (
    <>
      <PageHeader
        kicker="Good to know"
        title="FAQ."
        lede="Where we are, when we're open, what it costs to play, and how to book the room. Regent Street, Redfern; two minutes from the station."
      />

      <Section aria-labelledby="faq-visiting">
        <SectionHeading id="faq-visiting" kicker="Visiting">
          Turning up
        </SectionHeading>
        <div className="mt-8">
          <FaqList items={visiting} />
        </div>
      </Section>

      <Section tone="raised" hairline aria-labelledby="faq-functions">
        <SectionHeading id="faq-functions" kicker="Functions and bookings">
          Organising a group
        </SectionHeading>
        <p className="mt-6 max-w-prose font-body leading-relaxed text-crema/70">
          Short version: the room gets held for you, the enquiry is one short
          form, and groups your size have done this before and left happy.
        </p>
        <div className="mt-8">
          <FaqList items={functions} />
        </div>
      </Section>

      <Section spacing="tight" hairline>
        <p className="max-w-prose font-body text-crema/70">
          Questions this doesn&rsquo;t answer: email{" "}
          <a
            href="mailto:hello@beercade.com.au"
            className="text-high-score-orange underline underline-offset-4 decoration-hairline transition-colors hover:decoration-high-score-orange"
          >
            hello@beercade.com.au
          </a>{" "}
          or ask at the bar.
        </p>
      </Section>
    </>
  );
}
