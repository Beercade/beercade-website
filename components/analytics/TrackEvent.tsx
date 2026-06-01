"use client";

import { useEffect } from "react";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics/events";

export function TrackEvent({ name }: { name: AnalyticsEvent }) {
  useEffect(() => {
    trackEvent(name);
  }, [name]);

  return null;
}
