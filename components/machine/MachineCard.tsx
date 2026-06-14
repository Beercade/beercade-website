import { Link } from "next-view-transitions";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import { StatusPill } from "@/components/ui/StatusPill";
import { cn } from "@/lib/utils/cn";
import type { SanityImageSource } from "@sanity/image-url";

interface MachineCardProps {
  name: string;
  slug: { current: string };
  type: string;
  status: "working" | "maintenance" | "down";
  photo: SanityImageSource & { alt?: string };
  description?: string | null;
  className?: string;
}

export function MachineCard({
  name,
  slug,
  type,
  status,
  photo,
  description,
  className,
}: MachineCardProps) {
  return (
    <Link
      href={`/machines/${slug.current}`}
      className={cn(
        "group flex flex-col rounded-none focus-visible:outline-none",
        className
      )}
    >
      {/* The photo floats in a uniform 4:3 frame on a transparent ground, sized
          with object-contain so the whole machine shows uncropped (the Sanity
          URL no longer forces a 4:3 crop). photo-grade keeps CMS uploads on the
          late-night palette (brand §7); the cast lifts on hover. The
          view-transition name morphs the card image into the detail hero. */}
      <div
        className="photo-grade relative aspect-[4/3] overflow-hidden rounded-none transition-transform duration-[var(--motion-slow)] group-hover:scale-[1.02] group-focus-visible:ring-2 group-focus-visible:ring-crema"
        style={{ viewTransitionName: `machine-${slug.current}` }}
      >
        <Image
          src={urlFor(photo).width(800).fit("max").auto("format").url()}
          alt={photo.alt ?? name}
          fill
          className="object-contain"
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 pt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="t-h3 text-crema transition-colors group-hover:text-high-score-orange">
            {name}
          </h3>
          {/* "Working" is the default, so it's just noise on every card; only a
              machine that's down or in maintenance earns a pill. */}
          {status !== "working" && (
            <StatusPill status={status} kind="machine" className="shrink-0" />
          )}
        </div>
        <p className="font-body text-xs uppercase tracking-widest text-crema/50">
          {type}
        </p>
        {description && (
          <p className="font-body text-sm text-crema/70 line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}
