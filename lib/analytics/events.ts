import { track } from "@vercel/analytics";

// Named conversion events. Routed to Vercel Web Analytics (already wired in the
// root layout). Plausible was removed from the stack — see git history.
export type AnalyticsEvent =
  | "function-interest-captured"
  | "function-enquiry-submitted"
  | "newsletter-signup"
  | "cta-click-functions"
  | "cta-click-event"
  | "menu-pdf-download";

export function trackEvent(
  name: AnalyticsEvent,
  props?: Record<string, string | number>
) {
  if (typeof window === "undefined") return;
  track(name, props);
}
