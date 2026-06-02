import Link from "next/link";
import FinalsSignupForm from "@/components/league/FinalsSignupForm";
import { getPrepayEvent } from "@/lib/league/registrations";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";

// /league/finals — prepay signup, shown only when an Event is flagged
// prepayRequired. Otherwise it points players at the normal signup.
// Not statically cached: prepay state is operational and can flip on the day.

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Beercade League Finals — Reserve your spot",
};

export default async function FinalsSignupPage() {
  const event = await getPrepayEvent();

  if (!event || !event.prepayRequired) {
    return (
      <>
        <PageHeader kicker="Finals" title="Finals signup." />
        <Section>
          <p className="t-lede max-w-prose text-crema/70">
            Prepay isn&apos;t open. For the qualifying nights, sign up at the bar
            or through the{" "}
            <Link
              href="/league"
              className="text-high-score-orange underline underline-offset-4 decoration-hairline transition-colors hover:decoration-high-score-orange"
            >
              league page
            </Link>
            .
          </p>
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        kicker="Finals"
        title={event.title}
        lede={`Lock your finals spot. $${event.entryFeeAud} covers entry and a drink token.`}
      />
      <Section>
        <div className="max-w-xl">
          <FinalsSignupForm feeAud={event.entryFeeAud} />
        </div>
      </Section>
    </>
  );
}
