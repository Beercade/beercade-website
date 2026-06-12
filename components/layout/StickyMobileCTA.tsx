"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CTAButton } from "@/components/ui/CTAButton";
import { OpenNowBadge, type DayHours } from "@/components/layout/OpenNowBadge";

const SHOW_AFTER_PX = 480;

/**
 * Mobile-only booking bar pinned to the bottom of the viewport. The header's
 * "Book a function" CTA is desktop-only, so this is the persistent mobile path
 * to the highest-value form. Appears once the reader has scrolled past the
 * hero; on /functions it jumps straight to the enquiry form instead.
 */
export function StickyMobileCTA({
  weeklyHours,
}: {
  weeklyHours?: DayHours[] | null;
}) {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setVisible(window.scrollY > SHOW_AFTER_PX);
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const onFunctions = pathname?.startsWith("/functions");

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-after-dark px-4 pt-3 transition-[transform,visibility] duration-[var(--motion-base)] md:hidden ${
        visible ? "visible translate-y-0" : "invisible translate-y-full"
      }`}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      aria-hidden={!visible}
    >
      <div className="flex items-center justify-between gap-4">
        <OpenNowBadge weeklyHours={weeklyHours} />
        <CTAButton
          href={onFunctions ? "#enquire" : "/functions"}
          variant="primary"
          className="shrink-0 px-5 py-2.5 text-xs"
        >
          {onFunctions ? "Start your enquiry" : "Book a function"}
        </CTAButton>
      </div>
    </div>
  );
}
