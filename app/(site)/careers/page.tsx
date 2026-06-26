import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Want to work at Beercade Redfern? Send your resume and a 60-second video introducing yourself to hello@beercade.com.au.",
};

const linkClass =
  "text-high-score-orange underline underline-offset-4 decoration-hairline transition-colors hover:decoration-high-score-orange";

export default function CareersPage() {
  return (
    <>
      <PageHeader kicker="Careers" title="Work here." />

      <Section>
        <div className="max-w-prose space-y-8 font-body text-crema/70">
          <p>
            We&rsquo;re not always hiring, but we always read what comes in. If
            you want to work at Beercade, send us two things and we&rsquo;ll be
            in touch when something opens up.
          </p>

          <ol className="space-y-6">
            <li className="space-y-2">
              <h2 className="font-display text-lg text-crema">
                1. Your resume
              </h2>
              <p>The usual; where you&rsquo;ve worked and what you did.</p>
            </li>
            <li className="space-y-2">
              <h2 className="font-display text-lg text-crema">
                2. A 60-second video
              </h2>
              <p>
                Introduce yourself. Tell us a bit about who you are, why you
                want to work here, and why you&rsquo;d be good on the team. A
                phone camera is fine; we&rsquo;re not judging the production.
              </p>
            </li>
          </ol>

          <p>
            Send both to{" "}
            <a
              href="mailto:hello@beercade.com.au?subject=Job%20application"
              className={linkClass}
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
