import type { MenuSection } from "@/components/menu/types";

/**
 * One menu section on the public /menu page: title, optional note, groups of
 * priced items with a dotted leader between name and price (the same device
 * the printed sheet uses), footnotes in small print.
 */
export function MenuSectionBlock({ section }: { section: MenuSection }) {
  return (
    <section aria-labelledby={`menu-${section._id}`}>
      <h3 id={`menu-${section._id}`} className="t-h3 text-crema">
        {section.title}
      </h3>
      {section.note && (
        <p className="font-body mt-2 text-sm text-crema/60">{section.note}</p>
      )}

      <div className="mt-6 space-y-8">
        {section.groups?.map((group) => (
          <div key={group._key}>
            {group.heading && (
              <h4 className="font-display text-sm uppercase tracking-[-0.01em] text-high-score-orange">
                {group.heading}
              </h4>
            )}
            <ul className={group.heading ? "mt-3 space-y-3" : "space-y-3"} role="list">
              {group.items?.map((item) => (
                <li key={item._key}>
                  <div className="flex items-baseline gap-2">
                    <span className="font-body font-medium text-crema">
                      {item.name}
                    </span>
                    {item.price && (
                      <>
                        <span
                          className="min-w-4 flex-1 border-b border-dotted border-crema/25"
                          aria-hidden="true"
                        />
                        <span className="font-body shrink-0 font-medium text-crema">
                          {item.price}
                        </span>
                      </>
                    )}
                  </div>
                  {item.description && (
                    <p className="font-body mt-0.5 max-w-prose pr-10 text-sm text-crema/70">
                      {item.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {section.footnotes && section.footnotes.length > 0 && (
        <ul className="mt-6 space-y-1" role="list">
          {section.footnotes.map((line) => (
            <li key={line} className="font-body text-xs text-crema/60">
              {line}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
