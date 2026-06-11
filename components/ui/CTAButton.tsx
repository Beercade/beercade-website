import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost";

interface CTAButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  /**
   * Render a plain anchor with the download attribute instead of next/link.
   * Use for file responses (e.g. /api/menu-pdf) — Link would prefetch the
   * route and trigger the file generation before anyone clicks.
   */
  download?: boolean;
  "aria-label"?: string;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-high-score-orange text-after-dark hover:bg-crema focus-visible:ring-2 focus-visible:ring-high-score-orange focus-visible:ring-offset-2 focus-visible:ring-offset-last-train-purple",
  secondary:
    "border border-crema text-crema hover:bg-crema hover:text-after-dark focus-visible:ring-2 focus-visible:ring-crema focus-visible:ring-offset-2 focus-visible:ring-offset-last-train-purple",
  ghost:
    "text-crema underline underline-offset-4 decoration-hairline hover:decoration-high-score-orange hover:text-high-score-orange focus-visible:ring-2 focus-visible:ring-crema",
};

// Buttons in Archivo Black, all caps, tight tracking (brand §4.4). Hard edges.
const base =
  "inline-flex items-center justify-center rounded-none px-6 py-3 font-display text-sm uppercase tracking-[-0.01em] transition-colors duration-[var(--motion-fast)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";

export function CTAButton({
  href,
  onClick,
  variant = "primary",
  className,
  children,
  type = "button",
  disabled,
  download,
  "aria-label": ariaLabel,
}: CTAButtonProps) {
  const classes = cn(base, variantClasses[variant], className);

  if (href && download) {
    return (
      <a href={href} download className={classes} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
