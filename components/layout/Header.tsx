"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { CTAButton } from "@/components/ui/CTAButton";
import { OpenNowBadge, type DayHours } from "@/components/layout/OpenNowBadge";

const nav = [
  { label: "Machines", href: "/machines" },
  { label: "Menu", href: "/menu" },
  { label: "Functions", href: "/functions" },
  { label: "Find us", href: "/find-us" },
];

export function Header({ weeklyHours }: { weeklyHours?: DayHours[] | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-after-dark">
      <Container as="nav" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between gap-6">
          <Link
            href="/"
            className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crema"
            aria-label="Beercade — home"
          >
            <Image
              src="/images/beercade-horizontal-crema.svg"
              alt="Beercade"
              width={1000}
              height={409}
              priority
              unoptimized
              className="h-8 w-auto md:h-9"
            />
          </Link>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-8 md:flex" role="list">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-body text-sm font-medium text-crema/75 transition-colors hover:text-crema focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crema"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-6 md:flex">
            <OpenNowBadge weeklyHours={weeklyHours} className="hidden lg:flex" />
            <CTAButton href="/functions" variant="primary" className="shrink-0 text-xs">
              Book a function
            </CTAButton>
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="-mr-2 inline-flex items-center justify-center p-2 text-crema focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crema md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
              aria-hidden="true"
            >
              {open ? (
                <>
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </>
              ) : (
                <>
                  <line x1="3" y1="7" x2="21" y2="7" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="17" x2="21" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </Container>

      {/* Mobile menu panel */}
      {open && (
        <div
          id="mobile-menu"
          className="border-t border-hairline bg-after-dark md:hidden"
        >
          <Container>
            <ul className="flex flex-col py-2" role="list">
              {nav.map((item) => (
                <li key={item.href} className="border-b border-hairline/60 last:border-0">
                  <Link
                    href={item.href}
                    className="block py-4 font-heading text-lg font-bold text-crema focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crema"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="space-y-4 pb-6 pt-2">
              <OpenNowBadge weeklyHours={weeklyHours} />
              <CTAButton href="/functions" variant="primary" className="w-full">
                Book a function
              </CTAButton>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
