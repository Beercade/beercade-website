import { cn } from "@/lib/utils/cn";

type MachineStatus = "working" | "maintenance" | "down";
type EventStatus = "upcoming" | "live" | "wrapped" | "cancelled";

const machineLabels: Record<MachineStatus, string> = {
  working: "Working",
  maintenance: "Under maintenance",
  down: "Down",
};

const eventLabels: Record<EventStatus, string> = {
  upcoming: "Upcoming",
  live: "On now",
  wrapped: "Wrapped",
  cancelled: "Cancelled",
};

const machineStyles: Record<MachineStatus, string> = {
  working: "border border-hairline text-crema/80",
  maintenance: "border border-high-score-orange/70 text-high-score-orange",
  down: "border border-hairline text-crema/40",
};

const eventStyles: Record<EventStatus, string> = {
  upcoming: "border border-hairline text-crema/80",
  live: "bg-high-score-orange text-after-dark",
  wrapped: "border border-hairline text-crema/40",
  cancelled: "border border-hairline text-crema/40",
};

interface StatusPillProps {
  status: MachineStatus | EventStatus;
  kind?: "machine" | "event";
  className?: string;
}

export function StatusPill({
  status,
  kind = "machine",
  className,
}: StatusPillProps) {
  const label =
    kind === "machine"
      ? machineLabels[status as MachineStatus]
      : eventLabels[status as EventStatus];

  const style =
    kind === "machine"
      ? machineStyles[status as MachineStatus]
      : eventStyles[status as EventStatus];

  return (
    <span
      className={cn(
        "inline-block rounded-none px-2 py-0.5 font-body text-[0.7rem] font-medium uppercase tracking-wider",
        style,
        className
      )}
    >
      {label}
    </span>
  );
}
