"use client";

import { useState, useTransition } from "react";
import { submitTokenSignup } from "@/app/actions/submit-token-signup";
import { trackEvent } from "@/lib/analytics/events";

/**
 * $5-tokens lead-magnet form. Collects a first name (the voucher email greets by
 * name) plus email, posts to the tokens server action, and reports back in
 * voice. Mirrors NewsletterSignup; kept separate so the footer form stays a
 * single email field.
 */
export function TokenSignup() {
  const [state, setState] = useState<{ ok: boolean; error?: string } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("source", "tokens");
    startTransition(async () => {
      const result = await submitTokenSignup(formData);
      setState(result);
      if (result.ok) trackEvent("newsletter-signup", { source: "tokens" });
    });
  }

  const inputClass =
    "w-full rounded-none border border-tilt-purple bg-crema px-4 py-3 font-body text-base text-last-train-purple placeholder:text-last-train-purple/50 focus:border-high-score-orange focus:outline-none focus:ring-1 focus:ring-high-score-orange disabled:opacity-50";

  if (state?.ok) {
    return (
      <div
        className="border-tilt-purple bg-surface-raised rounded-none border p-6"
        role="status"
      >
        <p className="font-accent text-high-score-orange text-xs">Sorted.</p>
        <p className="font-body text-crema/85 mt-3">
          Check your inbox; your code is on the way. Check spam if it&rsquo;s
          playing hard to get.
        </p>
      </div>
    );
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

      <div>
        <label
          htmlFor="token-first-name"
          className="font-body text-crema/60 mb-1.5 block text-xs tracking-widest uppercase"
        >
          First name
        </label>
        <input
          id="token-first-name"
          type="text"
          name="firstName"
          placeholder="Dave"
          autoComplete="given-name"
          disabled={isPending}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="token-email"
          className="font-body text-crema/60 mb-1.5 block text-xs tracking-widest uppercase"
        >
          Email
        </label>
        <input
          id="token-email"
          type="email"
          name="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          disabled={isPending}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-high-score-orange font-display text-after-dark hover:bg-crema focus-visible:ring-high-score-orange focus-visible:ring-offset-surface-raised w-full rounded-none px-6 py-3.5 text-base tracking-[-0.01em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
      >
        {isPending ? "Loading your code…" : "Send me my $5 in tokens"}
      </button>

      <p className="font-body text-crema/50 text-xs leading-relaxed">
        One code per person. Good for 7 days. Redeemed at the bar, two minutes
        from Redfern Station. We&rsquo;re licensed; you&rsquo;ll need to be 18+
        to redeem.
      </p>

      {state?.error && (
        <p role="alert" className="font-body text-high-score-orange text-xs">
          {state.error}
        </p>
      )}
    </form>
  );
}
