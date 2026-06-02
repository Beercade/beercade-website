import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy." />
      <Section>
      <div className="max-w-prose space-y-4 font-body text-crema/70">
        {/* FILLME: privacy policy copy — consultant to draft */}
        <p>
          Beercade Australia collects personal information (name, email, phone)
          only when you submit a function enquiry or sign up for our newsletter.
          We use this information to respond to your enquiry and, if you
          consent, to send you updates about events.
        </p>
        <p>
          We do not sell or share your personal information with third parties
          except as required to deliver the services you&rsquo;ve requested
          (email delivery via Resend, calendar management via Google).
        </p>
        <p>
          To request access to, correction of, or deletion of your data, email{" "}
          <a
            href="mailto:hello@beercade.com.au"
            className="text-high-score-orange underline underline-offset-4 decoration-hairline transition-colors hover:decoration-high-score-orange"
          >
            hello@beercade.com.au
          </a>
          .
        </p>
      </div>
      </Section>
    </>
  );
}
