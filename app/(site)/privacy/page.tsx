import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Privacy",
};

const privacyLinkClass =
  "text-high-score-orange underline underline-offset-4 decoration-hairline transition-colors hover:decoration-high-score-orange";

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy." />
      <Section>
        <div className="max-w-prose space-y-8 font-body text-crema/70">
          <p className="text-sm text-crema/50">
            Last updated 17 June 2026. This explains what personal information
            Beercade Australia collects through this website, why we collect it,
            and who we share it with. It follows the Australian Privacy
            Principles under the Privacy Act 1988 (Cth).
          </p>

          <div className="space-y-3">
            <h2 className="font-display text-lg text-crema">What we collect</h2>
            <p>
              We only collect what you give us, plus a small amount of technical
              data needed to run the site securely.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-crema/80">Function enquiries:</strong>{" "}
                your name, email, phone (optional), preferred date and time,
                group size, occasion, drinks and food preferences, and any notes
                you add.
              </li>
              <li>
                <strong className="text-crema/80">
                  Newsletter and token signups:
                </strong>{" "}
                your email address, and a tag noting which form you used.
              </li>
              <li>
                <strong className="text-crema/80">
                  League finals registration:
                </strong>{" "}
                your name, email, and IFPA number if you provide one. Payment is
                handled on Square&rsquo;s checkout; we never see or store your
                card details.
              </li>
              <li>
                <strong className="text-crema/80">Automatically:</strong> your
                IP address and basic request data, used to rate-limit forms,
                block spam, and keep the site up. Analytics are aggregate and
                cookieless; we do not build advertising profiles.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg text-crema">Why we collect it</h2>
            <p>
              To answer your function enquiry, hold a tentative booking, send you
              updates you&rsquo;ve asked for, register you for the league, and
              protect the site from abuse. We do not use your details for
              anything you haven&rsquo;t asked for, and we don&rsquo;t sell them.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg text-crema">
              Who we share it with
            </h2>
            <p>
              We use a small set of service providers to run the site. They only
              receive the data needed to do their job, and only act on our
              instructions:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Sanity — stores enquiry and content records.</li>
              <li>Resend — sends our notification and confirmation emails.</li>
              <li>Google Calendar — holds tentative booking slots for our team.</li>
              <li>Kit — runs our newsletter and token mailing lists.</li>
              <li>Square — processes league finals payments.</li>
              <li>Cloudflare Turnstile — verifies you&rsquo;re human on our forms.</li>
              <li>Upstash — rate-limits form submissions.</li>
              <li>Vercel — hosts the site and provides aggregate analytics.</li>
              <li>Sentry — records technical errors so we can fix them.</li>
            </ul>
            <p>
              Some of these providers store data overseas. We only use them where
              they offer protections consistent with the Australian Privacy
              Principles. We may also disclose information where the law requires
              it.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg text-crema">
              How long we keep it
            </h2>
            <p>
              We keep enquiry and registration records for as long as we need
              them to run events and meet our legal obligations, then remove
              them. You can ask us to delete your data sooner.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg text-crema">
              Access, correction, and complaints
            </h2>
            <p>
              To access, correct, or delete the personal information we hold
              about you, or to unsubscribe from emails, email{" "}
              <a href="mailto:hello@beercade.com.au" className={privacyLinkClass}>
                hello@beercade.com.au
              </a>
              . If you think we&rsquo;ve mishandled your information and
              we can&rsquo;t resolve it with you, you can contact the Office of
              the Australian Information Commissioner at{" "}
              <a
                href="https://www.oaic.gov.au"
                className={privacyLinkClass}
                target="_blank"
                rel="noopener noreferrer"
              >
                oaic.gov.au
              </a>
              .
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
