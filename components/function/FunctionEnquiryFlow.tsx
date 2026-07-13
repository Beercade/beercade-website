"use client";

import { useEffect, useState, useTransition } from "react";
import { submitFunctionInterest } from "@/app/actions/submit-function-interest";
import { FunctionEnquiryForm } from "@/components/function/FunctionEnquiryForm";
import { trackEvent } from "@/lib/analytics/events";

type Lead = { firstName: string; email: string };

const inputClass =
  "w-full rounded-none border border-tilt-purple bg-crema px-4 py-3 font-body text-sm text-last-train-purple placeholder:text-last-train-purple/50 focus:border-high-score-orange focus:outline-none focus:ring-1 focus:ring-high-score-orange disabled:opacity-50";

/**
 * Two-step function enquiry. Step 1 captures first name + email so the lead is
 * banked the moment someone shows interest; step 2 reveals the full qualifying
 * form, pre-filled. Anyone who stops at step 1 is already tagged in Kit and gets
 * the "finish your enquiry" nudge, so a half-finished enquiry isn't a lost one.
 */
export function FunctionEnquiryFlow() {
  const [lead, setLead] = useState<Lead | null>(null);

  // A returning nudge-email click can deep-link straight to the full form with
  // details pre-filled (?email=…&name=…), skipping step 1. They were already
  // banked in Kit on their first visit, so there's no lead to lose by skipping.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = (params.get("email") ?? "").trim();
    if (!email) return;
    const firstName = (params.get("name") ?? "").trim();
    setLead({ firstName, email });
  }, []);

  if (lead) {
    return (
      <div className="space-y-5">
        <p className="font-body text-crema/70 text-sm">
          Got it{lead.firstName ? `, ${lead.firstName}` : ""}. We&rsquo;ve got
          your details. Last bit so we can hold a date and send a real quote.
        </p>
        <FunctionEnquiryForm
          defaultName={lead.firstName}
          defaultEmail={lead.email}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <InterestCapture onCaptured={setLead} />
    </div>
  );
}

function InterestCapture({ onCaptured }: { onCaptured: (lead: Lead) => void }) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const firstName = String(formData.get("firstName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();

    startTransition(async () => {
      const result = await submitFunctionInterest(formData);
      if (result.ok) {
        trackEvent("function-interest-captured");
        onCaptured({ firstName, email });
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Honeypot — hidden from real users */}
      <input
        type="text"
        name="honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-2499.75 h-0 w-0 overflow-hidden"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="fi-first-name"
            className="font-body text-crema/80 mb-1 block text-sm font-medium"
          >
            First name
            <span className="text-high-score-orange ml-1" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="fi-first-name"
            type="text"
            name="firstName"
            required
            autoComplete="given-name"
            placeholder="Sarah"
            disabled={isPending}
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="fi-email"
            className="font-body text-crema/80 mb-1 block text-sm font-medium"
          >
            Email
            <span className="text-high-score-orange ml-1" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="fi-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            disabled={isPending}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-high-score-orange font-display text-after-dark hover:bg-crema focus-visible:ring-high-score-orange focus-visible:ring-offset-surface-raised w-full rounded-none px-6 py-3.5 text-base tracking-[-0.01em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50 sm:w-auto"
      >
        {isPending ? "Starting…" : "Start my enquiry"}
      </button>

      <p className="font-body text-crema/50 text-xs">
        Two fields to start; the detail comes next. We&rsquo;ll only use this to
        talk to you about your function.
      </p>

      {error && (
        <p role="alert" className="font-body text-high-score-orange text-xs">
          {error}
        </p>
      )}
    </form>
  );
}
