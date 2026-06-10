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
        "group relative flex flex-col overflow-hidden rounded-none border border-hairline bg-surface-raised transition-colors hover:border-tilt-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crema",
        className
      )}
    >
      {/* photo-grade keeps CMS uploads on the late-night palette (brand §7);
          the cast lifts to full colour on hover. The view-transition name lets
          the card image morph into the detail hero on navigation. */}
      <div
        className="photo-grade relative aspect-[4/3] overflow-hidden bg-after-dark"
        style={{ viewTransitionName: `machine-${slug.current}` }}
      >
        <Image
          src={urlFor(photo).width(600).height(450).auto("format").url()}
          alt={photo.alt ?? name}
          fill
          className="object-cover transition-transform duration-[var(--motion-slow)] group-hover:scale-105"
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="t-h3 text-crema">{name}</h3>
          <StatusPill status={status} kind="machine" className="shrink-0" />
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
