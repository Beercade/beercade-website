import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import { StatusPill } from "@/components/ui/StatusPill";
import { CTAButton } from "@/components/ui/CTAButton";
import { Container } from "@/components/ui/Container";
import { PortableText } from "next-sanity";
import type { SanityImageSource } from "@sanity/image-url";

interface Machine {
  _id: string;
  name: string;
  slug: { current: string };
  photo?: (SanityImageSource & { alt?: string }) | null;
}

interface EventDetailProps {
  title: string;
  kicker?: string | null;
  kind: string;
  startDate: string;
  endDate?: string | null;
  recurring?: string | null;
  entry?: string | null;
  prize?: string | null;
  body?: unknown[] | null;
  ctaLabel?: string | null;
  ctaTarget?: string | null;
  ctaUrl?: string | null;
  hero?: (SanityImageSource & { alt?: string }) | null;
  machines?: Machine[] | null;
  status: "upcoming" | "live" | "wrapped" | "cancelled";
}

function resolveCta(
  ctaTarget?: string | null,
  ctaUrl?: string | null,
  title?: string
): string {
  if (ctaTarget === "function-form") return "/functions#enquire";
  if (ctaTarget === "external" && ctaUrl) return ctaUrl;
  if (ctaTarget === "email-functions")
    return `mailto:functions@beercade.com.au?subject=${encodeURIComponent(title ?? "Event enquiry")}`;
  return "/functions";
}

export function EventDetail({
  title,
  kicker,
  kind,
  startDate,
  endDate,
  recurring,
  entry,
  prize,
  body,
  ctaLabel = "Reserve a spot",
  ctaTarget,
  ctaUrl,
  hero,
  machines,
  status,
}: EventDetailProps) {
  const ctaHref = resolveCta(ctaTarget, ctaUrl, title);
  const isExternal = ctaTarget === "external" || ctaTarget === "email-functions";

  const startStr = new Date(startDate).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const endStr = endDate
    ? new Date(endDate).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "long",
      })
    : null;

  return (
    <article>
      {/* Hero */}
      {hero && (
        <div className="relative aspect-[16/7] w-full overflow-hidden bg-after-dark">
          <Image
            src={urlFor(hero).width(1280).height(560).auto("format").url()}
            alt={hero.alt ?? title}
            fill
            priority
            className="object-cover opacity-70"
            sizes="100vw"
          />
        </div>
      )}

      <Container className="py-12">
        <div className="grid gap-12 md:grid-cols-[1fr_300px]">
          {/* Main */}
          <div className="space-y-6">
            {kicker && <p className="t-kicker">{kicker}</p>}
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="t-display text-crema text-balance">{title}</h1>
              <StatusPill status={status} kind="event" />
            </div>

            {body && body.length > 0 && (
              <div className="prose prose-invert max-w-prose font-body text-crema/80 [&_a]:text-high-score-orange [&_a:hover]:underline">
                <PortableText value={body as Parameters<typeof PortableText>[0]["value"]} />
              </div>
            )}

            {machines && machines.length > 0 && (
              <div>
                <h2 className="t-kicker mb-3 text-crema/50">Machines</h2>
                <div className="flex flex-wrap gap-2">
                  {machines.map((m) => (
                    <a
                      key={m._id}
                      href={`/machines/${m.slug.current}`}
                      className="rounded-none border border-hairline bg-surface-raised px-3 py-1.5 font-body text-sm text-crema/80 transition-colors hover:border-tilt-purple hover:text-crema focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crema"
                    >
                      {m.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-none border border-hairline bg-surface-raised p-6 space-y-4">
              <dl className="space-y-3 font-body text-sm">
                <div>
                  <dt className="text-crema/50">Date</dt>
                  <dd className="mt-0.5 text-crema">{startStr}</dd>
                  {endStr && (
                    <dd className="text-crema/70">to {endStr}</dd>
                  )}
                </div>
                {recurring && (
                  <div>
                    <dt className="text-crema/50">Schedule</dt>
                    <dd className="mt-0.5 text-crema">{recurring}</dd>
                  </div>
                )}
                {entry && (
                  <div>
                    <dt className="text-crema/50">Entry</dt>
                    <dd className="mt-0.5 text-crema">{entry}</dd>
                  </div>
                )}
                {prize && (
                  <div>
                    <dt className="text-crema/50">Prize</dt>
                    <dd className="mt-0.5 text-crema">{prize}</dd>
                  </div>
                )}
              </dl>

              <CTAButton
                href={ctaHref}
                variant="primary"
                className="w-full"
                {...(isExternal
                  ? { "aria-label": `${ctaLabel} (opens external link)` }
                  : {})}
              >
                {ctaLabel}
              </CTAButton>
            </div>
          </aside>
        </div>
      </Container>
    </article>
  );
}
