import Image from "next/image";

interface ParallaxBackdropProps {
  /** Path to a full-bleed background image under /public. */
  image: string;
  /** Decorative by default; pass alt text only if the image carries meaning. */
  alt?: string;
  /** Window height. Defaults to 60vh, matching the prototype rhythm. */
  className?: string;
}

/**
 * Fixed-background parallax "portal".
 *
 * The section clips a `position: fixed` image to its own bounds (`clip-path`
 * creates the containing block; `isolate` the stacking context). The image
 * stays pinned to the viewport while the section scrolls past it, so the
 * picture is revealed through a moving window — the parallax reveal used
 * between content sections on the prototype homepage.
 *
 * Brand tint (After Dark → Tilt Purple) keeps the portals on-palette and adds
 * depth without washing the photography out.
 */
export function ParallaxBackdrop({
  image,
  alt = "",
  className = "h-[60vh]",
}: ParallaxBackdropProps) {
  return (
    <section
      aria-hidden={alt === "" ? true : undefined}
      className={`relative isolate w-full overflow-hidden ${className}`}
      style={{ clipPath: "inset(0)" }}
    >
      <div className="pointer-events-none fixed inset-0 z-0">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="100vw"
          className="scale-105 object-cover"
        />
        {/* Brand-tinted depth overlay — keeps the portals on-palette. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgb(20 16 26 / 0.25), rgb(42 23 69 / 0.20) 50%, rgb(20 16 26 / 0.45) 100%)",
          }}
        />
      </div>
    </section>
  );
}
