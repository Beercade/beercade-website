"use client";

import { CTAButton } from "@/components/ui/CTAButton";

export const PACKAGE_SELECT_EVENT = "beercade:package-select";

/**
 * "Enquire" CTA on a package card. Jumps to the enquiry form and broadcasts
 * the chosen package so the form can carry it into the enquiry — interest
 * generated at the card has a one-click path to the form.
 */
export function PackageEnquireButton({ packageName }: { packageName: string }) {
  return (
    <CTAButton
      href="#enquire"
      variant="secondary"
      className="mt-5 w-full"
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent<string>(PACKAGE_SELECT_EVENT, { detail: packageName })
        );
      }}
    >
      Enquire about this one
    </CTAButton>
  );
}
