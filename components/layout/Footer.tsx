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
    <footer className="border-t border-hairline bg-after-dark py-16">
      <Container>
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <Link href="/" aria-label="Beercade — home" className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crema">
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

          <nav aria-label="Footer navigation" className="md:text-right">
            <p className="t-kicker mb-4">Beercade</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-3 md:flex-col md:items-end" role="list">
              {links.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-body text-sm text-crema/70 transition-colors hover:text-crema focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crema"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 space-y-2 border-t border-hairline pt-8">
          {/* Liquor licensing — NSW. FILLME: insert the venue's real licensee
              legal name + NSW liquor licence number before launch (confirm the
              exact number with Liquor & Gaming NSW). Do not ship a placeholder
              number live. */}
          <p className="max-w-prose font-body text-xs text-crema/50">
            Licensed venue. Licensee:{" "}
            <span className="text-crema/40">[licensee legal name — FILLME]</span>.
            Liquor Licence No.{" "}
            <span className="text-crema/40">[FILLME]</span>. It is against the law
            to sell or supply alcohol to, or to obtain alcohol on behalf of, a
            person under the age of 18.
          </p>
          <p className="font-body text-xs text-crema/40">
            © {new Date().getFullYear()} Beercade Australia. Drink responsibly.
          </p>
        </div>
      </Container>
    </footer>
  );
}
