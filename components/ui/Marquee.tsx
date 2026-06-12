/**
 * Deadpan one-liner ticker — a gig-poster trope, CSS-only (no JS), pauses on
 * hover and goes static under reduced motion. The scrolling track is
 * decorative; screen readers get the lines once, statically.
 */
export function Marquee({ lines }: { lines: string[] }) {
  return (
    <div className="marquee border-y border-hairline bg-after-dark py-5">
      <p className="sr-only">{lines.join(" ")}</p>
      <div className="marquee-track" aria-hidden="true">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 items-center">
            {lines.map((line, i) => (
              <span
                key={i}
                className="whitespace-nowrap font-display text-lg uppercase tracking-[-0.01em] text-crema/40 md:text-xl"
              >
                {line}
                <span className="mx-10 text-high-score-orange/70">■</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
