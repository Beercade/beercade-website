import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import { StatusPill } from "@/components/ui/StatusPill";
import { CTAButton } from "@/components/ui/CTAButton";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils/cn";
import type { SanityImageSource } from "@sanity/image-url";

interface HighScore {
  value?: string;
  holder?: string;
  setOn?: string;
}

interface MachineDetailProps {
  name: string;
  type: string;
  slug?: { current: string } | null;
  manufacturer?: string | null;
  year?: number | null;
  status: "working" | "maintenance" | "down";
  photo: SanityImageSource & { alt?: string };
  description?: string | null;
  highScore?: HighScore | null;
  logoBackground?: "light" | "dark" | null;
}

export function MachineDetail({
  name,
  type,
  slug,
  manufacturer,
  year,
  status,
  photo,
  description,
  highScore,
  logoBackground,
}: MachineDetailProps) {
  // Match the card: dark logos on a cream band (uncropped), pale/gold logos on
  // the dark ground (cover-cropped, dimmed) where they read better.
  const lightTile = logoBackground !== "dark";
  return (
    <article>
      {/* Hero image — shares a view-transition name with the machine card so
          the card morphs into this hero on navigation. */}
      <div
        className="relative aspect-[16/7] w-full overflow-hidden bg-after-dark"
        style={
          slug ? { viewTransitionName: `machine-${slug.current}` } : undefined
        }
      >
        {lightTile ? (
          <div className="absolute left-1/2 top-1/2 aspect-[16/9] h-[78%] -translate-x-1/2 -translate-y-1/2 bg-crema">
            <Image
              src={urlFor(photo).width(800).fit("max").auto("format").url()}
              alt={photo.alt ?? name}
              fill
              priority
              className="object-contain p-[5%]"
              sizes="(min-width: 768px) 40vw, 70vw"
            />
          </div>
        ) : (
          <Image
            src={urlFor(photo).width(1280).height(560).auto("format").url()}
            alt={photo.alt ?? name}
            fill
            priority
            className="object-cover opacity-80"
            sizes="100vw"
          />
        )}
      </div>

      <Container className="py-12">
        <div className="grid gap-12 md:grid-cols-[1fr_320px]">
          {/* Main content */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill status={status} kind="machine" />
                <span className="font-body text-xs uppercase tracking-widest text-crema/50">
                  {type}
                </span>
                {manufacturer && (
                  <span className="font-body text-xs text-crema/40">
                    {manufacturer}
                    {year ? `, ${year}` : ""}
                  </span>
                )}
              </div>
              <h1 className="t-display text-crema text-balance">{name}</h1>
            </div>

            {description && (
              <p className="max-w-prose font-body text-lg leading-relaxed text-crema/80">
                {description}
              </p>
            )}

            {/* High score callout */}
            {highScore?.value && (
              <div className="rounded-none border border-hairline bg-surface-raised p-6">
                <p className="font-accent text-xs text-high-score-orange">
                  HI SCORE
                </p>
                <p className="mt-3 font-display text-4xl text-crema">
                  {highScore.value}
                </p>
                {highScore.holder && (
                  <p className="mt-1 font-body text-sm text-crema/60">
                    {highScore.holder}
                    {highScore.setOn && (
                      <>
                        {" "}
                        &mdash;{" "}
                        {new Date(highScore.setOn).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar CTAs */}
          <aside className="space-y-4">
            <div className="rounded-none border border-hairline bg-surface-raised p-6 space-y-4">
              <p className="font-body text-sm text-crema/70">
                See what&rsquo;s on next, or book the room around this machine.
              </p>
              <CTAButton href="/whats-on" variant="secondary" className="w-full">
                See what&rsquo;s on
              </CTAButton>
              <CTAButton href="/functions" variant="primary" className="w-full">
                Book a function
              </CTAButton>
            </div>
          </aside>
        </div>
      </Container>
    </article>
  );
}
