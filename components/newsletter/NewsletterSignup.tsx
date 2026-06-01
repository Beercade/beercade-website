"use client";

import { useState, useTransition } from "react";
import { submitNewsletterSignup } from "@/app/actions/submit-newsletter-signup";
import { trackEvent } from "@/lib/analytics/events";

interface Props {
  source: "footer" | "popup";
}

export function NewsletterSignup({ source }: Props) {
  const [state, setState] = useState<{ ok: boolean; error?: string } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("source", source);
    startTransition(async () => {
      const result = await submitNewsletterSignup(formData);
      setState(result);
      if (result.ok) trackEvent("newsletter-signup", { source });
    });
  }

  if (state?.ok) {
    return (
      <p className="font-body text-sm text-crema/80">
        Done. Check your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`newsletter-email-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`newsletter-email-${source}`}
          type="email"
          name="email"
          placeholder="your@email.com"
          required
          autoComplete="email"
          disabled={isPending}
          className="min-w-0 flex-1 rounded-sm border border-tilt-purple/40 bg-last-train-purple px-4 py-2.5 font-body text-sm text-crema placeholder:text-crema/30 focus:border-tilt-purple focus:outline-none focus:ring-1 focus:ring-tilt-purple disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-sm bg-high-score-orange px-5 py-2.5 font-body text-sm font-medium text-after-dark transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-high-score-orange disabled:opacity-50"
        >
          {isPending ? "Sending…" : "Sign up"}
        </button>
      </div>
      {state?.error && (
        <p role="alert" className="mt-2 font-body text-xs text-high-score-orange">
          {state.error}
        </p>
      )}
    </form>
  );
}
