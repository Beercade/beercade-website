import type { Metadata } from "next";

import { sanityClient } from "@/lib/sanity/client";
import { menuSectionsQuery } from "@/lib/sanity/queries";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { CTAButton } from "@/components/ui/CTAButton";
import { MenuSectionBlock } from "@/components/menu/MenuSectionBlock";
import { bySide, type MenuSection } from "@/components/menu/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Cocktails, shots, jugs, token packs, and happy hour at Beercade Redfern. Games average $2 or 2 tokens. Schooners drop to $7 from 4pm.",
};

export default async function MenuPage() {
  const sections = await sanityClient
    .fetch<MenuSection[]>(menuSectionsQuery)
    .catch(() => []);
  const { drinks, play } = bySide(sections);

  return (
    <>
      <PageHeader
        kicker="Drinks · shots · tokens"
        title="The menu."
        lede={
          /* FILLME: in-voice lede for the menu page — current line is a working draft */
          "What's behind the bar, what a game costs, and when the schooners drop to $7."
        }
      />

      {/* Drinks — side 1 of the printed sheet */}
      <Section aria-label="Drinks">
        <div className="grid gap-14 md:grid-cols-2 md:gap-x-16">
          {drinks.map((section) => (
            <MenuSectionBlock key={section._id} section={section} />
          ))}
        </div>
        {drinks.length === 0 && (
          <p className="font-body text-crema/70">
            {/* Rendered only when the studio has no menu content yet. */}
            The menu is being typed up. Ask at the bar.
          </p>
        )}
      </Section>

      {/* Tokens, jugs, happy hour — side 2 of the printed sheet */}
      {play.length > 0 && (
        <Section tone="raised" hairline aria-label="Tokens, jugs, and happy hour">
          <div className="grid gap-14 md:grid-cols-2 md:gap-x-16">
            {play.map((section) => (
              <MenuSectionBlock key={section._id} section={section} />
            ))}
          </div>
        </Section>
      )}

      {/* Printable copy */}
      <Section hairline spacing="tight" aria-label="Printable menu">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="t-h3 text-crema">The paper version.</h2>
            <p className="font-body mt-2 text-sm text-crema/70">
              The same menu as a two-sided A3 PDF, built from whatever is on
              this page right now.
            </p>
          </div>
          <CTAButton href="/api/menu-pdf" variant="secondary" download>
            Download the A3 menu (PDF)
          </CTAButton>
        </div>
      </Section>
    </>
  );
}
