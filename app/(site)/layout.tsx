import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyMobileCTA } from "@/components/layout/StickyMobileCTA";
import { sanityClient } from "@/lib/sanity/client";
import { openingHoursQuery } from "@/lib/sanity/queries";
import type { DayHours } from "@/components/layout/OpenNowBadge";

export const revalidate = 60;

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hours: { weeklyHours?: DayHours[] } | null = await sanityClient
    .fetch(openingHoursQuery)
    .catch(() => null);
  const weeklyHours = hours?.weeklyHours ?? null;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-crema focus:px-4 focus:py-2 focus:text-after-dark focus:outline-none"
      >
        Skip to content
      </a>
      <Header weeklyHours={weeklyHours} />
      <main id="main">{children}</main>
      <Footer />
      <StickyMobileCTA weeklyHours={weeklyHours} />
    </>
  );
}
