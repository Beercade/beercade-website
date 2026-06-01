import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";

const links = [
  { label: "Machines", href: "/machines" },
  { label: "What's on", href: "/whats-on" },
  { label: "Functions", href: "/functions" },
  { label: "Find us", href: "/find-us" },
  { label: "Privacy", href: "/privacy" },
];

export function Footer() {
  return (
    <footer className="border-t border-tilt-purple/30 bg-last-train-purple py-12">
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <Link href="/" aria-label="Beercade — home" className="inline-block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crema">
              <Image
                src="/images/beercade-horizontal-crema.png"
                alt="Beercade"
                width={271}
                height={129}
                className="h-10 w-auto"
              />
            </Link>
            <p className="font-body text-sm text-crema/60">
              113 Regent Street, Redfern NSW 2016
            </p>
            <p className="font-body text-sm text-crema/60">
              Two minutes from Redfern Station.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-6 gap-y-2" role="list">
              {links.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-body text-sm text-crema/60 transition-colors hover:text-crema focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crema"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t border-tilt-purple/20 pt-8">
          <p className="font-body text-xs text-crema/40">
            © {new Date().getFullYear()} Beercade Australia. Licensed venue.
            Drink responsibly.
          </p>
        </div>
      </Container>
    </footer>
  );
}
