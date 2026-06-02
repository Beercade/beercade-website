"use client";

import { useEffect, useRef, useState } from "react";
import { NewsletterSignup } from "./NewsletterSignup";

const SESSION_KEY = "beercade-exit-popup-seen";

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY <= 0) {
        setVisible(true);
        sessionStorage.setItem(SESSION_KEY, "1");
        document.removeEventListener("mouseleave", handleMouseLeave);
      }
    }

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  // Focus trap + Escape key
  useEffect(() => {
    if (!visible) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    const panel = panelRef.current;
    if (!panel) return;

    const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    focusable[0]?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setVisible(false);
        return;
      }
      if (e.key !== "Tab" || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-popup-heading"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-after-dark/80"
        onClick={() => setVisible(false)}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-md rounded-none border border-hairline bg-surface-raised p-8"
      >
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Close"
          className="absolute right-4 top-4 font-body text-sm text-crema/40 hover:text-crema focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tilt-purple"
        >
          ✕
        </button>

        <p className="t-kicker mb-2">Before you go</p>
        <h2
          id="exit-popup-heading"
          className="t-h2 mb-2 text-crema"
        >
          Thursday nights, tournament dates, new machines.
        </h2>
        <p className="mb-6 font-body text-sm text-crema/60">
          No noise. Just the good stuff, when it happens.
        </p>

        <NewsletterSignup source="popup" />
      </div>
    </div>
  );
}
