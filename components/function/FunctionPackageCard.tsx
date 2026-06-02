import { cn } from "@/lib/utils/cn";

export interface FunctionTier {
  name: string;
  /** Short "best for" overline. */
  bestFor: string;
  /** One-line description, set in italics. */
  tagline: string;
  groupSize: string;
  /** Free text so it can carry "$48 / head" or "From $X,XXX min spend". */
  price: string;
  priceNote?: string;
  youGet: string[];
  /** Notice + deposit line. */
  toHold: string;
  /** One-line pitch, pinned to the bottom. */
  pitch: string;
  /** Highlight the recommended middle tier. */
  featured?: boolean;
}

export function FunctionPackageCard({
  name,
  bestFor,
  tagline,
  groupSize,
  price,
  priceNote,
  youGet,
  toHold,
  pitch,
  featured = false,
  className,
}: FunctionTier & { className?: string }) {
  return (
    <article
      className={cn(
        "relative flex flex-col rounded-none bg-surface-raised p-6",
        featured ? "border-2 border-high-score-orange" : "border border-hairline",
        className
      )}
    >
      {featured && (
        <span className="absolute -top-3 left-6 rounded-none bg-high-score-orange px-2 py-0.5 font-body text-[0.7rem] font-medium uppercase tracking-wider text-after-dark">
          Most groups book this
        </span>
      )}

      <p className="t-kicker">{bestFor}</p>
      <h3 className="mt-3 font-display text-2xl text-crema">{name}</h3>
      <p className="mt-2 font-body text-sm italic text-crema/70">{tagline}</p>

      <p className="mt-5 font-display text-3xl text-high-score-orange">
        {price}
      </p>
      {priceNote && (
        <p className="mt-1 font-body text-xs text-crema/50">{priceNote}</p>
      )}

      <p className="mt-4 font-body text-xs uppercase tracking-widest text-crema/50">
        {groupSize} people
      </p>

      <ul className="mt-4 space-y-2" aria-label={`${name} inclusions`}>
        {youGet.map((item, i) => (
          <li key={i} className="flex gap-2 font-body text-sm text-crema/85">
            <span className="mt-0.5 shrink-0 text-high-score-orange" aria-hidden="true">
              ›
            </span>
            {item}
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-hairline pt-4 font-body text-xs text-crema/50">
        To hold it: {toHold}
      </p>

      <p className="mt-4 font-body text-sm italic text-crema/70">{pitch}</p>
    </article>
  );
}
