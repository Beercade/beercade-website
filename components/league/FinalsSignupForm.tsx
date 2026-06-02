"use client";

import { useState, useTransition } from "react";
import { createFinalsCheckout } from "@/app/actions/create-finals-checkout";

// Client form for finals prepay. Posts to the server action, then redirects the
// browser to the Square hosted checkout. ID is still checked at the door — this
// only takes the entry fee and reserves the spot.

export default function FinalsSignupForm({ feeAud }: { feeAud: number }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createFinalsCheckout(formData);
      if (result.ok && result.url) {
        window.location.href = result.url;
      } else {
        setError(result.error ?? "Something went wrong. Try again.");
      }
    });
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="font-body text-sm text-crema/70">Name</span>
        <input
          name="playerName"
          required
          autoComplete="name"
          className="rounded-none border border-hairline bg-after-dark px-3 py-2 font-body text-sm text-crema placeholder:text-crema/30 focus:border-high-score-orange focus:outline-none focus:ring-1 focus:ring-high-score-orange"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-body text-sm text-crema/70">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-none border border-hairline bg-after-dark px-3 py-2 font-body text-sm text-crema placeholder:text-crema/30 focus:border-high-score-orange focus:outline-none focus:ring-1 focus:ring-high-score-orange"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-body text-sm text-crema/70">IFPA number (optional)</span>
        <input
          name="ifpaNumber"
          inputMode="numeric"
          className="rounded-none border border-hairline bg-after-dark px-3 py-2 font-body text-sm text-crema placeholder:text-crema/30 focus:border-high-score-orange focus:outline-none focus:ring-1 focus:ring-high-score-orange"
        />
      </label>

      {error && (
        <p role="alert" className="font-body text-sm text-high-score-orange">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-none bg-high-score-orange px-5 py-3 font-display text-sm uppercase tracking-[-0.01em] text-after-dark transition-colors hover:bg-crema focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-high-score-orange disabled:opacity-60"
      >
        {pending ? "Taking you to checkout…" : `Pay $${feeAud} and lock my spot`}
      </button>

      <p className="font-body text-sm text-crema/60">
        18+. Bring ID. Payment is handled by Square; we never see your card details.
      </p>
    </form>
  );
}
