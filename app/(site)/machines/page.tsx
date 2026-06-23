import type { Metadata } from "next";
import { sanityClient } from "@/lib/sanity/client";
import { allMachinesQuery } from "@/lib/sanity/queries";
import { MachineGrid, type MachineListItem } from "@/components/machine/MachineGrid";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { ExitIntentPopupLazy as ExitIntentPopup } from "@/components/newsletter/ExitIntentPopupLazy";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Machines",
  description:
    "Every machine on the floor — pinball, arcade, racing. 113-115 Regent Street, Redfern.",
};

export default async function MachinesPage() {
  const machines: MachineListItem[] = await sanityClient
    .fetch(allMachinesQuery)
    .catch(() => []);

  return (
    <>
      {/* FILLME: in-voice intro for the machines page (title + optional lede) */}
      <PageHeader id="machines-heading" kicker="Pinball · arcade · racing" title="The machines." />

      <Section aria-labelledby="machines-heading">
        {machines.length > 0 ? (
          <>
            {/* The count is the brag — hierarchy through scale (brand §6). */}
            <div className="mb-10 flex items-baseline gap-4">
              <span className="t-numeral text-high-score-orange">
                {machines.length}
              </span>
              <span className="t-arcade text-crema/60">on the floor</span>
            </div>
            <MachineGrid machines={machines} />
          </>
        ) : (
          <p className="font-body text-crema/50">
            {/* PLACEHOLDER: shown before content is entered in Sanity */}
            Machines loading&hellip;
          </p>
        )}
      </Section>

      <ExitIntentPopup />
    </>
  );
}
