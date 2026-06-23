"use client";

import dynamic from "next/dynamic";

// `next/dynamic` with `ssr: false` is only allowed inside a Client Component
// (Next 15+). The popup is client-only (listens for mouse-leave, reads
// sessionStorage) so we lazy-load it here and let Server Component pages import
// this wrapper directly.
const ExitIntentPopup = dynamic(
  () =>
    import("@/components/newsletter/ExitIntentPopup").then(
      (m) => m.ExitIntentPopup
    ),
  { ssr: false }
);

export function ExitIntentPopupLazy() {
  return <ExitIntentPopup />;
}
