import Image from "next/image";
import { cn } from "@/lib/utils/cn";

interface FeatureImageProps {
  src: string;
  /** Decorative by default; pass alt only if the image carries meaning. */
  alt?: string;
  /** Tailwind height classes. Defaults to a calm establishing band. */
  className?: string;
  /** Eager-load when above the fold. */
  priority?: boolean;
  sizes?: string;
}

/**
 * Full-bleed establishing photograph (brand §7 — wide shots used once to set
 * the room). A static `next/image` with a brand-tinted gradient for depth and
 * text legibility. No fixed-position/clip-path tricks — robust and cheap.
 */
export function FeatureImage({
  src,
  alt = "",
  className = "h-[48vh] md:h-[58vh]",
  priority = false,
  sizes = "100vw",
}: FeatureImageProps) {
  return (
    <div
      aria-hidden={alt === "" ? true : undefined}
      className={cn("relative w-full overflow-hidden bg-after-dark", className)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
      />
      {/* Brand-tinted depth — keeps the band on-palette and anchors any overlaid type. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgb(20 16 26 / 0.35), rgb(42 23 69 / 0.25) 45%, rgb(20 16 26 / 0.55) 100%)",
        }}
      />
    </div>
  );
}
