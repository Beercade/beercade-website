import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import { StatusPill } from "@/components/ui/StatusPill";
import { cn } from "@/lib/utils/cn";
import type { SanityImageSource } from "@sanity/image-url";

interface EventCardProps {
  title: string;
  slug: { current: string };
  kicker?: string | null;
  kind: string;
  startDate: string;
  status: "upcoming" | "live" | "wrapped" | "cancelled";
  hero?: (SanityImageSource & { alt?: string }) | null;
  entry?: string | null;
  className?: string;
}

export function EventCard({
  title,
  slug,
  kicker,
  kind,
  startDate,
  status,
  hero,
  entry,
  className,
}: EventCardProps) {
  const dateStr = new Date(startDate).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <Link
      href={`/whats-on/${slug.current}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-none border border-hairline bg-surface-raised transition-colors hover:border-tilt-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crema",
        className
      )}
    >
      {hero && (
        <div className="photo-grade relative aspect-video overflow-hidden bg-after-dark">
          <Image
            src={urlFor(hero).width(800).height(450).auto("format").url()}
            alt={hero.alt ?? title}
            fill
            className="object-cover transition-transform duration-[var(--motion-slow)] group-hover:scale-105"
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {kicker && <p className="t-kicker">{kicker}</p>}
        <div className="flex items-start justify-between gap-2">
          <h3 className="t-h3 text-crema">{title}</h3>
          <StatusPill status={status} kind="event" className="shrink-0" />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-crema/60">
          <span className="font-body">{dateStr}</span>
          {entry && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-body">{entry}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
