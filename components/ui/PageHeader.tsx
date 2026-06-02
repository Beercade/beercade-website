import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils/cn";

interface PageHeaderProps {
  /** Short overline — Archivo Black, uppercase, orange. */
  kicker?: string;
  title: React.ReactNode;
  /** Optional one- or two-line intro under the title. */
  lede?: React.ReactNode;
  /** id for the H1, to wire aria-labelledby on the page. */
  id?: string;
  className?: string;
}

/**
 * Confident editorial header for interior pages. Big Archivo Black title at
 * display scale, generous top space, a hairline rule that anchors the content
 * below it. Replaces the small `SectionHeading as="h1"` openers that made
 * interior pages feel like they started mid-thought.
 */
export function PageHeader({ kicker, title, lede, id, className }: PageHeaderProps) {
  return (
    <header className={cn("bg-surface pt-28 md:pt-36", className)}>
      <Container>
        <div className="border-b border-hairline pb-10 md:pb-14">
          {kicker && <p className="t-kicker mb-4">{kicker}</p>}
          <h1 id={id} className="t-display max-w-4xl text-crema text-balance">
            {title}
          </h1>
          {lede && (
            <p className="t-lede mt-6 max-w-2xl text-crema/70">{lede}</p>
          )}
        </div>
      </Container>
    </header>
  );
}
