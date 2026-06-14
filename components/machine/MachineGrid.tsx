"use client";

import { useMemo, useState } from "react";
import { MachineCard } from "@/components/machine/MachineCard";
import { cn } from "@/lib/utils/cn";
import type { SanityImageSource } from "@sanity/image-url";

export interface MachineListItem {
  _id: string;
  name: string;
  slug: { current: string };
  type: string;
  status: "working" | "maintenance" | "down";
  photo: SanityImageSource & { alt?: string };
  description?: string | null;
  logoBackground?: "light" | "dark" | null;
}

const TYPE_LABELS: Record<string, string> = {
  pinball: "Pinball",
  arcade: "Arcade",
  racing: "Racing",
  other: "Other",
};

// Working machines lead the grid; a down machine never fronts the lineup.
const STATUS_ORDER: Record<MachineListItem["status"], number> = {
  working: 0,
  maintenance: 1,
  down: 2,
};

/**
 * Filterable machine grid. Tabs are derived from the types actually on the
 * floor, so an empty category never renders a dead filter.
 */
export function MachineGrid({ machines }: { machines: MachineListItem[] }) {
  const [filter, setFilter] = useState<string>("all");

  const types = useMemo(() => {
    const present = Object.keys(TYPE_LABELS).filter((t) =>
      machines.some((m) => m.type === t)
    );
    return present;
  }, [machines]);

  const visible = useMemo(() => {
    const filtered =
      filter === "all" ? machines : machines.filter((m) => m.type === filter);
    return [...filtered].sort(
      (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    );
  }, [machines, filter]);

  const tabs = [
    { value: "all", label: "All", count: machines.length },
    ...types.map((t) => ({
      value: t,
      label: TYPE_LABELS[t],
      count: machines.filter((m) => m.type === t).length,
    })),
  ];

  return (
    <div>
      {types.length > 1 && (
        <div
          role="group"
          aria-label="Filter machines by type"
          className="mb-8 flex flex-wrap gap-2"
        >
          {tabs.map((tab) => {
            const active = filter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(tab.value)}
                className={cn(
                  "rounded-none border px-4 py-2 font-display text-xs uppercase tracking-[-0.01em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crema",
                  active
                    ? "border-high-score-orange bg-high-score-orange text-after-dark"
                    : "border-hairline text-crema/70 hover:border-tilt-purple hover:text-crema"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "ml-2 font-body text-[0.65rem] tracking-normal",
                    active ? "text-after-dark/70" : "text-crema/40"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div
        className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-x-8 md:gap-y-12"
        aria-live="polite"
      >
        {visible.map((machine) => (
          <MachineCard key={machine._id} {...machine} />
        ))}
      </div>
    </div>
  );
}
