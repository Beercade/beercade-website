import type { Metadata } from "next";
import Image from "next/image";

import { sanityClient } from "@/lib/sanity/client";
import { menuSectionsQuery } from "@/lib/sanity/queries";
import { bySide, type MenuSection } from "@/components/menu/types";

import "./print.css";

// Always render fresh content: this route exists so /api/menu-pdf can print
// it, and the PDF should reflect the studio as it stands right now.
export const dynamic = "force-dynamic";

// Print artefact, not a public page.
export const metadata: Metadata = {
  title: "Menu — print sheet",
  robots: { index: false, follow: false },
};

/* Two-sided A3 sheet in Combination C (brand guide §3.3): Last Train Purple
   ground for large-format printed collateral (§3.2), Crema body, Tilt Purple
   display headlines, High Score Orange reserved for display-size accents. */

function PrintItem({
  name,
  description,
  price,
  dense,
}: {
  name: string;
  description?: string | null;
  price?: string | null;
  dense?: boolean;
}) {
  const nameSize = dense ? "text-[10pt]" : "text-[11pt]";
  const descSize = dense ? "text-[8pt]" : "text-[8.5pt]";
  return (
    <li className="break-inside-avoid">
      <div className="flex items-baseline gap-2">
        <span
          className={`font-body ${nameSize} font-semibold leading-snug text-crema`}
        >
          {name}
        </span>
        {price && (
          <>
            <span
              className="min-w-3 flex-1 border-b border-dotted border-crema/30"
              aria-hidden="true"
            />
            <span
              className={`font-body shrink-0 ${nameSize} font-semibold text-crema`}
            >
              {price}
            </span>
          </>
        )}
      </div>
      {description && (
        <p
          className={`font-body mt-[0.5mm] pr-[8mm] ${descSize} leading-snug text-crema/75`}
        >
          {description}
        </p>
      )}
    </li>
  );
}

function PrintSection({
  section,
  scale,
}: {
  section: MenuSection;
  /** "dense" = drinks side (small type, columned); "feature" = play side. */
  scale: "dense" | "feature";
}) {
  const feature = scale === "feature";
  return (
    <section>
      <h2
        className={
          feature
            ? "font-display text-[24pt] uppercase tracking-[-0.01em] text-tilt-purple"
            : "font-display text-[16pt] uppercase tracking-[-0.01em] text-tilt-purple"
        }
      >
        {section.title}
      </h2>
      {section.note && (
        <p className="font-body mt-[1.5mm] text-[9pt] text-crema/70">
          {section.note}
        </p>
      )}

      <div className={feature ? "mt-[5mm] space-y-[6mm]" : "mt-[3mm] space-y-[4mm]"}>
        {section.groups?.map((group) => (
          <div key={group._key} className="break-inside-avoid">
            {group.heading && (
              <h3 className="font-display text-[11pt] uppercase tracking-[-0.01em] text-high-score-orange">
                {group.heading}
              </h3>
            )}
            <ul
              className={
                (group.heading ? "mt-[2mm] " : "") +
                (feature ? "space-y-[3mm]" : "space-y-[2mm]")
              }
              role="list"
            >
              {group.items?.map((item) => (
                <PrintItem key={item._key} {...item} dense={!feature} />
              ))}
            </ul>
          </div>
        ))}
      </div>

      {section.footnotes && section.footnotes.length > 0 && (
        <ul className="mt-[4mm] space-y-[1mm]" role="list">
          {section.footnotes.map((line) => (
            <li key={line} className="font-body text-[7.5pt] text-crema/65">
              {line}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SheetHeader({ subtitle }: { subtitle: string }) {
  return (
    <header className="flex items-end justify-between border-b-2 border-tilt-purple pb-[6mm]">
      <Image
        src="/images/beercade-horizontal-crema.png"
        alt="Beercade"
        width={271}
        height={129}
        priority
        unoptimized
        className="h-[22mm] w-auto"
      />
      <p className="font-display text-[18pt] uppercase tracking-[-0.01em] text-crema">
        {subtitle}
      </p>
    </header>
  );
}

function SheetFooter() {
  return (
    <footer className="mt-auto border-t border-crema/20 pt-[4mm]">
      <p className="font-body text-[8.5pt] text-crema/65">
        113 Regent Street, Redfern — two minutes from the station.
      </p>
    </footer>
  );
}

export default async function MenuPrintPage() {
  const sections = await sanityClient
    .fetch<MenuSection[]>(menuSectionsQuery)
    .catch(() => []);
  const { drinks, play } = bySide(sections);

  return (
    <div className="bg-after-dark">
      {/* Side 1 — drinks */}
      <div className="print-sheet flex flex-col bg-last-train-purple p-[14mm]">
        <SheetHeader subtitle="Drinks menu" />
        <div className="mt-[6mm] columns-2 gap-x-[12mm]">
          {drinks.map((section, i) => (
            <div key={section._id} className={i > 0 ? "mt-[6mm]" : ""}>
              <PrintSection section={section} scale="dense" />
            </div>
          ))}
        </div>
        <SheetFooter />
      </div>

      {/* Side 2 — how to play, jugs, happy hour */}
      <div className="print-sheet flex flex-col bg-last-train-purple p-[14mm]">
        <SheetHeader subtitle="How to play" />
        <div className="mt-[10mm] grid grid-cols-2 gap-x-[14mm]">
          {/* First section fills the left column; the rest stack on the right. */}
          <div>
            {play[0] && <PrintSection section={play[0]} scale="feature" />}
          </div>
          <div className="space-y-[14mm]">
            {play.slice(1).map((section) => (
              <PrintSection key={section._id} section={section} scale="feature" />
            ))}
          </div>
        </div>
        <SheetFooter />
      </div>
    </div>
  );
}
