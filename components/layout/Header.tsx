import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { CTAButton } from "@/components/ui/CTAButton";

const nav = [
  { label: "Machines", href: "/machines" },
  { label: "What's on", href: "/whats-on" },
  { label: "Find us", href: "/find-us" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-tilt-purple/30 bg-last-train-purple/90 backdrop-blur-sm">
      <Container as="nav" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between gap-6">
          <Link
            href="/"
            className="shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crema"
            aria-label="Beercade — home"
          >
            <Image
              src="/images/beercade-horizontal-crema.png"
              alt="Beercade"
              width={271}
              height={129}
              priority
              className="h-8 w-auto md:h-9"
            />
          </Link>

          <ul className="hidden items-center gap-6 md:flex" role="list">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-body text-sm font-medium text-crema/80 transition-colors hover:text-crema focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crema"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <CTAButton href="/functions" variant="primary" className="shrink-0 text-xs">
            Book a function
          </CTAButton>
        </div>
      </Container>
    </header>
  );
}
