"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  functionEnquirySchema,
  type FunctionEnquiryInput,
} from "@/lib/validation/function-enquiry";
import { submitFunctionEnquiry } from "@/app/actions/submit-function-enquiry";
import { CTAButton } from "@/components/ui/CTAButton";
import { cn } from "@/lib/utils/cn";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="font-body text-high-score-orange mt-1 text-xs"
    >
      {message}
    </p>
  );
}

function Label({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="font-body text-crema/80 mb-1 block text-sm font-medium"
    >
      {children}
      {required && (
        <span className="text-high-score-orange ml-1" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

const inputBase =
  "w-full rounded-none border border-tilt-purple bg-crema px-4 py-3 font-body text-sm text-last-train-purple placeholder:text-last-train-purple/50 focus:border-high-score-orange focus:outline-none focus:ring-1 focus:ring-high-score-orange aria-invalid:border-high-score-orange";

type ActionResult = { ok: false; errors: Record<string, string[]> } | null;

interface FunctionEnquiryFormProps {
  /** Pre-fill from the step-1 interest capture. */
  defaultName?: string;
  defaultEmail?: string;
}

export function FunctionEnquiryForm({
  defaultName,
  defaultEmail,
}: FunctionEnquiryFormProps = {}) {
  const [state, setState] = useState<ActionResult>(null);
  const [isPending, startTransition] = useTransition();

  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileTokenRef = useRef<HTMLInputElement>(null);

  const {
    register,
    formState: { errors },
    setError,
  } = useForm<FunctionEnquiryInput>({
    resolver: zodResolver(functionEnquirySchema),
    defaultValues: {
      name: defaultName ?? "",
      email: defaultEmail ?? "",
    },
  });

  // Propagate server-side field errors back into react-hook-form
  useEffect(() => {
    if (!state || state.ok !== false) return;
    for (const [field, msgs] of Object.entries(state.errors)) {
      if (field !== "_form") {
        setError(field as keyof FunctionEnquiryInput, {
          message: (msgs as string[])[0],
        });
      }
    }
  }, [state, setError]);

  // Load Turnstile widget
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileRef.current) return;

    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => {
      if (
        typeof window !== "undefined" &&
        (
          window as {
            turnstile?: { render: (el: HTMLElement, opts: object) => void };
          }
        ).turnstile &&
        turnstileRef.current
      ) {
        (
          window as {
            turnstile?: { render: (el: HTMLElement, opts: object) => void };
          }
        ).turnstile!.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => {
            if (turnstileTokenRef.current) {
              turnstileTokenRef.current.value = token;
            }
          },
        });
      }
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const formError = state?.ok === false ? state.errors._form?.[0] : null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await submitFunctionEnquiry(state, formData);
      setState(result);
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Honeypot — hidden from real users */}
      <input
        type="text"
        name="honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-2499.75 h-0 w-0 overflow-hidden"
      />

      {/* Turnstile token (populated by widget callback) */}
      <input
        type="hidden"
        name="turnstileToken"
        ref={turnstileTokenRef}
        defaultValue=""
      />

      {formError && (
        <div
          role="alert"
          className="border-high-score-orange/60 bg-high-score-orange/10 font-body text-high-score-orange rounded-none border p-4 text-sm"
        >
          {formError}
        </div>
      )}

      {/* Name */}
      <div>
        <Label htmlFor="name" required>
          Name
        </Label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          {...register("name")}
          aria-describedby={errors.name ? "name-error" : undefined}
          aria-invalid={!!errors.name}
          className={inputBase}
        />
        <FieldError id="name-error" message={errors.name?.message} />
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email" required>
          Email
        </Label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          aria-describedby={errors.email ? "email-error" : undefined}
          aria-invalid={!!errors.email}
          className={inputBase}
        />
        <FieldError id="email-error" message={errors.email?.message} />
      </div>

      {/* Phone */}
      <div>
        <Label htmlFor="phone">Phone (optional)</Label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          {...register("phone")}
          className={inputBase}
        />
      </div>

      {/* Group size + date — 2 col */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="groupSize" required>
            Group size
          </Label>
          <input
            id="groupSize"
            type="number"
            min={6}
            max={100}
            {...register("groupSize")}
            aria-describedby={errors.groupSize ? "groupSize-error" : undefined}
            aria-invalid={!!errors.groupSize}
            className={inputBase}
          />
          <FieldError
            id="groupSize-error"
            message={errors.groupSize?.message}
          />
          <p className="font-body text-crema/40 mt-1 text-xs">Minimum 6</p>
        </div>
        <div>
          <Label htmlFor="preferredDate" required>
            Preferred date
          </Label>
          <input
            id="preferredDate"
            type="date"
            // Sydney "today" as YYYY-MM-DD (not UTC) so the venue's current day
            // is always selectable and SSR/client render the same min.
            min={new Date().toLocaleDateString("en-CA", {
              timeZone: "Australia/Sydney",
            })}
            {...register("preferredDate")}
            aria-describedby={
              errors.preferredDate ? "preferredDate-error" : undefined
            }
            aria-invalid={!!errors.preferredDate}
            className={inputBase}
          />
          <FieldError
            id="preferredDate-error"
            message={errors.preferredDate?.message}
          />
        </div>
      </div>

      {/* Preferred time */}
      <div>
        <Label htmlFor="preferredTime" required>
          Preferred time window
        </Label>
        <select
          id="preferredTime"
          {...register("preferredTime")}
          aria-invalid={!!errors.preferredTime}
          aria-describedby={
            errors.preferredTime ? "preferredTime-error" : undefined
          }
          className={inputBase}
        >
          <option value="">Select&hellip;</option>
          <option value="17-21">5pm &ndash; 9pm</option>
          <option value="18-22">6pm &ndash; 10pm</option>
          <option value="19-23">7pm &ndash; 11pm</option>
          <option value="other">Other (we&rsquo;ll discuss)</option>
        </select>
        <FieldError
          id="preferredTime-error"
          message={errors.preferredTime?.message}
        />
      </div>

      {/* Occasion */}
      <div>
        <Label htmlFor="occasion" required>
          Occasion
        </Label>
        <select
          id="occasion"
          {...register("occasion")}
          aria-invalid={!!errors.occasion}
          aria-describedby={errors.occasion ? "occasion-error" : undefined}
          className={inputBase}
        >
          <option value="">Select&hellip;</option>
          <option value="birthday">Birthday</option>
          <option value="eofy">EOFY</option>
          <option value="corporate">Corporate</option>
          <option value="hens-bucks">Hens / bucks</option>
          <option value="other">Other</option>
        </select>
        <FieldError id="occasion-error" message={errors.occasion?.message} />
      </div>

      {/* Drinks style */}
      <div>
        <Label htmlFor="drinksStyle" required>
          Drinks style
        </Label>
        <select
          id="drinksStyle"
          {...register("drinksStyle")}
          aria-invalid={!!errors.drinksStyle}
          aria-describedby={
            errors.drinksStyle ? "drinksStyle-error" : undefined
          }
          className={inputBase}
        >
          <option value="">Select&hellip;</option>
          <option value="bar-tab">Bar tab (we run a tab)</option>
          <option value="cash-bar">Cash bar (guests pay their own)</option>
          <option value="mixed">Mixed</option>
        </select>
        <FieldError
          id="drinksStyle-error"
          message={errors.drinksStyle?.message}
        />
      </div>

      {/* Machine preference */}
      <div>
        <Label htmlFor="machinePreference">Machine preference (optional)</Label>
        <input
          id="machinePreference"
          type="text"
          placeholder="e.g. Godzilla LE, Daytona"
          {...register("machinePreference")}
          className={inputBase}
        />
      </div>

      {/* Food + notes */}
      <div className="flex items-center gap-3">
        <input
          id="food"
          type="checkbox"
          {...register("food")}
          className="border-hairline bg-after-dark accent-tilt-purple h-4 w-4 rounded-none"
        />
        <label htmlFor="food" className="font-body text-crema/80 text-sm">
          Food required
        </label>
      </div>

      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <textarea
          id="notes"
          rows={4}
          maxLength={600}
          placeholder="Anything else we should know?"
          {...register("notes")}
          className={cn(inputBase, "resize-none")}
        />
      </div>

      {/* Turnstile widget */}
      <div ref={turnstileRef} aria-label="Bot verification" />

      {/* Consent */}
      <div className="space-y-1">
        <div className="flex items-start gap-3">
          <input
            id="consent"
            type="checkbox"
            {...register("consent")}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            aria-invalid={!!errors.consent}
            className="border-hairline bg-after-dark accent-tilt-purple mt-0.5 h-4 w-4 rounded-none"
          />
          <label htmlFor="consent" className="font-body text-crema/70 text-sm">
            OK to be contacted by Beercade about this enquiry{" "}
            <span className="text-high-score-orange" aria-hidden="true">
              *
            </span>
          </label>
        </div>
        <FieldError id="consent-error" message={errors.consent?.message} />
      </div>

      <CTAButton
        type="submit"
        variant="primary"
        disabled={isPending}
        className="w-full py-4 text-base sm:w-auto"
      >
        {isPending ? "Sending…" : "Send enquiry"}
      </CTAButton>
    </form>
  );
}
