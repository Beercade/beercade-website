import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils/cn";

type Tone = "default" | "raised" | "feature-orange" | "feature-purple";

/**
 * Standard page section — one vertical rhythm and a fixed set of brand grounds
 * so pages stop hand-rolling `py-*` and opacity tints. Tones map to the brand's
 * working colour combinations (§3.3): `default`/`raised` are Last Train Purple
 * grounds (Combination C, long-form), `feature-orange` is Combination B
 * (High Score Orange ground, After Dark text), `feature-purple` is full Tilt.
 */
const toneClasses: Record<Tone, string> = {
  default: "bg-surface text-crema",
  raised: "bg-surface-raised text-crema",
  "feature-orange": "bg-high-score-orange text-after-dark",
  "feature-purple": "bg-tilt-purple text-crema",
};

interface SectionProps {
  children: React.ReactNode;
  tone?: Tone;
  /** Thin Tilt-Purple rule along the top edge. */
  hairline?: boolean;
  /** Vertical rhythm. `default` = py-20/28, `tight` = py-12/16. */
  spacing?: "default" | "tight";
  /** Skip the inner Container (for full-bleed content). */
  bleed?: boolean;
  className?: string;
  containerClassName?: string;
  id?: string;
  "aria-labelledby"?: string;
  "aria-label"?: string;
}

export function Section({
  children,
  tone = "default",
  hairline = false,
  spacing = "default",
  bleed = false,
  className,
  containerClassName,
  id,
  "aria-labelledby": ariaLabelledby,
  "aria-label": ariaLabel,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledby}
      aria-label={ariaLabel}
      className={cn(
        spacing === "tight" ? "py-12 md:py-16" : "py-20 md:py-28",
        toneClasses[tone],
        hairline && "border-t border-hairline",
        className
      )}
    >
      {bleed ? children : <Container className={containerClassName}>{children}</Container>}
    </section>
  );
}
