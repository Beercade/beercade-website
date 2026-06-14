import type { Metadata } from "next";
import { CTAButton } from "@/components/ui/CTAButton";
import { Container } from "@/components/ui/Container";
import { TrackEvent } from "@/components/analytics/TrackEvent";

export const metadata: Metadata = {
  title: "Enquiry received",
  robots: { index: false },
};

export default function ThanksPage() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center gap-6 py-24 text-center">
      <TrackEvent name="function-enquiry-submitted" />
      <p className="font-accent text-xs text-high-score-orange">Done.</p>
      <h1 className="t-h1 text-crema">Enquiry received.</h1>
      <p className="t-lede max-w-md text-crema/70">
        We&rsquo;ll be in touch within 24 hours with the details. If you need us
        sooner, reply to the confirmation email.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <CTAButton href="/machines" variant="primary">
          See the machines
        </CTAButton>
      </div>
    </Container>
  );
}
