"use client";

import { useState } from "react";

import { CTAButton } from "@/components/ui/CTAButton";
import { trackEvent } from "@/lib/analytics/events";

const FILENAME = "beercade-menu-a3.pdf";
const FALLBACK_ERROR = "The PDF didn't generate. Try again in a minute.";

// The PDF is rendered in headless Chromium, so it takes several seconds. A
// plain <a download> looks dead the whole time, so fetch it ourselves and
// swap the button into a building state; surface the route's own friendly
// error (rate-limit, generation failure) if it doesn't come back.
export function MenuPdfButton() {
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (building) return;
    setBuilding(true);
    setError(null);
    try {
      const res = await fetch("/api/menu-pdf");
      if (!res.ok) {
        let message = FALLBACK_ERROR;
        try {
          const data = await res.json();
          if (typeof data?.error === "string") message = data.error;
        } catch {
          // Non-JSON body; keep the fallback copy.
        }
        setError(message);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = FILENAME;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      trackEvent("menu-pdf-download");
    } catch {
      setError(FALLBACK_ERROR);
    } finally {
      setBuilding(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <CTAButton
        variant="secondary"
        onClick={handleClick}
        disabled={building}
        aria-label={building ? "Building the A3 menu PDF" : undefined}
      >
        {building ? "Building the PDF…" : "Download the A3 menu (PDF)"}
      </CTAButton>
      <p role="status" aria-live="polite" className="sr-only">
        {building ? "Building the PDF." : ""}
      </p>
      {error && (
        <p role="alert" className="font-body text-xs text-high-score-orange">
          {error}
        </p>
      )}
    </div>
  );
}
