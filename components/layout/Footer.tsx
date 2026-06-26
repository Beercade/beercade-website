import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";

const links = [
  { label: "Machines", href: "/machines" },
  { label: "Menu", href: "/menu" },
  { label: "Functions", href: "/functions" },
  { label: "Contact us", href: "/contact-us" },
  { label: "FAQ", href: "/faq" },
  { label: "Careers", href: "/careers" },
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
                src="/images/beercade-horizontal-crema.svg"
                alt="Beercade"
                width={1000}
                height={409}
                unoptimized
                className="h-10 w-auto"
              />
            </Link>
            <p className="font-body text-sm text-crema/60">
              113-115 Regent Street, Redfern NSW 2016
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

        <div className="mt-12 space-y-4 border-t border-hairline pt-8">
          <p className="t-kicker">Acknowledgement of Country</p>
          <p className="max-w-prose font-body text-sm text-crema/70">
            Beercade pours on the land of the Gadigal people of the Eora Nation,
            and here in Redfern, a place that has been a heart of Aboriginal
            Sydney for generations. We acknowledge the Gadigal as the
            traditional custodians of this land, pay our respects to Elders past
            and present, and extend that respect to every Aboriginal and Torres
            Strait Islander person who walks through the door. Sovereignty was
            never ceded. This always was, and always will be, Aboriginal land.
          </p>
          <p className="max-w-prose font-body text-sm text-crema/70">
            And the welcome&rsquo;s for everyone. Gay, straight, trans,
            non-binary, however you identify and whoever you walked in with; book
            with us and you&rsquo;ll get no second look you didn&rsquo;t come
            for. We take the welcome seriously even if we take almost nothing
            else seriously. The only crowd we&rsquo;ve got no time for is
            wankers. That&rsquo;s the whole door policy.
          </p>
        </div>

        <div className="mt-12 space-y-2 border-t border-hairline pt-8">
          {/* Liquor licensing — NSW. Beercade's Small Bar Liquor Licence, per
              the Liquor & Gaming NSW public register. The Dock (182 Redfern St,
              LIQS220000010) is a separate venue and is not represented here. */}
          <p className="max-w-prose font-body text-xs text-crema/50">
            Licensed venue. Licensee: Roger Robertson. Liquor Licence No.
            LIQS220000240. It is against the law to sell or supply alcohol to,
            or to obtain alcohol on behalf of, a person under the age of 18.
          </p>
          <p className="font-body text-xs text-crema/40">
            © {new Date().getFullYear()} Beercade Australia. Drink responsibly.
          </p>
        </div>
      </Container>
    </footer>
  );
}
