import { cn } from "@/lib/utils/cn";

interface FunctionPackageCardProps {
  name: string;
  minHeads?: number | null;
  maxHeads?: number | null;
  pricePerHead?: number | null;
  duration?: number | null;
  inclusions?: string[] | null;
  machinesIncluded?: string | null;
  description?: string | null;
  className?: string;
}

export function FunctionPackageCard({
  name,
  minHeads,
  maxHeads,
  pricePerHead,
  duration,
  inclusions,
  machinesIncluded,
  description,
  className,
}: FunctionPackageCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col rounded-none border border-hairline bg-surface-raised p-6",
        className
      )}
    >
      <h3 className="t-h3 text-crema">{name}</h3>

      {pricePerHead && (
        <p className="mt-2 font-display text-4xl text-high-score-orange">
          ${pricePerHead}
          <span className="font-body text-sm font-normal text-crema/50">
            {" "}
            / head
          </span>
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-body text-sm text-crema/60">
        {minHeads && maxHeads && (
          <span>
            {minHeads}&ndash;{maxHeads} people
          </span>
        )}
        {duration && (
          <span>
            {duration} hour{duration !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-4 font-body text-sm text-crema/70">{description}</p>
      )}

      {inclusions && inclusions.length > 0 && (
        <ul className="mt-4 space-y-1" aria-label="Package inclusions">
          {inclusions.map((item, i) => (
            <li key={i} className="flex gap-2 font-body text-sm text-crema/80">
              <span className="mt-0.5 shrink-0 text-tilt-purple" aria-hidden="true">
                &mdash;
              </span>
              {item}
            </li>
          ))}
        </ul>
      )}

      {machinesIncluded && (
        <p className="mt-4 border-t border-tilt-purple/20 pt-4 font-body text-xs text-crema/50">
          Machines: {machinesIncluded}
        </p>
      )}
    </article>
  );
}
