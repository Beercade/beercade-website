"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

export interface DayHours {
  day: string;
  open?: string;
  close?: string;
  closed?: boolean;
}

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** "15:00" → minutes since midnight. */
function toMinutes(t?: string): number | null {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

/** Minutes since midnight → "3pm" / "9:30pm" / "midnight". */
function formatMinutes(mins: number): string {
  const normalised = ((mins % 1440) + 1440) % 1440;
  if (normalised === 0) return "midnight";
  const h = Math.floor(normalised / 60);
  const m = normalised % 60;
  const period = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}${period}` : `${hour}:${String(m).padStart(2, "0")}${period}`;
}

interface SydneyNow {
  day: string;
  minutes: number;
}

function sydneyNow(): SydneyNow {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Australia/Sydney",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const hour = Number(get("hour")) % 24; // hour12:false can yield "24"
  return {
    day: get("weekday"),
    minutes: hour * 60 + Number(get("minute")),
  };
}

interface OpenState {
  open: boolean;
  label: string;
}

/**
 * Resolve the venue's open/closed state from the Sanity weekly hours.
 * Close times at or before the open time are read as past midnight
 * (e.g. open 15:00, close 00:00).
 */
export function resolveOpenState(
  weeklyHours: DayHours[],
  now: SydneyNow
): OpenState | null {
  if (!weeklyHours.length) return null;
  const byDay = new Map(weeklyHours.map((d) => [d.day, d]));
  const todayIdx = DAY_ORDER.indexOf(now.day);
  if (todayIdx === -1) return null;

  const windowFor = (d?: DayHours) => {
    if (!d || d.closed) return null;
    const open = toMinutes(d.open);
    let close = toMinutes(d.close);
    if (open === null || close === null) return null;
    if (close <= open) close += 1440; // crosses midnight
    return { open, close };
  };

  // Still inside yesterday's past-midnight window?
  const yesterday = byDay.get(DAY_ORDER[(todayIdx + 6) % 7]);
  const yWindow = windowFor(yesterday);
  if (yWindow && now.minutes + 1440 < yWindow.close) {
    return { open: true, label: `Open till ${formatMinutes(yWindow.close)}` };
  }

  const today = windowFor(byDay.get(now.day));
  if (today && now.minutes >= today.open && now.minutes < today.close) {
    return { open: true, label: `Open till ${formatMinutes(today.close)}` };
  }
  if (today && now.minutes < today.open) {
    return { open: false, label: `Opens ${formatMinutes(today.open)} today` };
  }

  // Scan forward for the next opening.
  for (let i = 1; i <= 7; i++) {
    const day = DAY_ORDER[(todayIdx + i) % 7];
    const w = windowFor(byDay.get(day));
    if (w) {
      return {
        open: false,
        label: `Opens ${formatMinutes(w.open)} ${i === 1 ? "tomorrow" : day}`,
      };
    }
  }
  return null;
}

interface OpenNowBadgeProps {
  weeklyHours?: DayHours[] | null;
  className?: string;
}

/**
 * Live "Open till midnight" / "Opens 3pm Wed" badge, computed in Sydney time.
 * Rendered client-side after mount so server and client clocks can't disagree
 * across the hydration boundary.
 */
export function OpenNowBadge({ weeklyHours, className }: OpenNowBadgeProps) {
  const [state, setState] = useState<OpenState | null>(null);

  useEffect(() => {
    if (!weeklyHours?.length) return;
    const update = () => setState(resolveOpenState(weeklyHours, sydneyNow()));
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [weeklyHours]);

  if (!state) return null;

  return (
    <p
      className={cn(
        "flex items-center gap-2 font-body text-xs font-medium uppercase tracking-wider",
        state.open ? "text-crema/80" : "text-crema/50",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block h-1.5 w-1.5 shrink-0",
          state.open ? "bg-high-score-orange" : "bg-crema/30"
        )}
      />
      {state.label}
    </p>
  );
}
