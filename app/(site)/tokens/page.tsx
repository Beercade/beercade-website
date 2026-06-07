import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { CTAButton } from "@/components/ui/CTAButton";
import { TokenSignup } from "@/components/newsletter/TokenSignup";

export const metadata: Metadata = {
  title: "$5 in tokens",
  description:
    "Sign up to the Beercade list and get $5 in arcade tokens. Redeemed at the bar in Redfern, two minutes from the station. Good for 7 days.",
};

const deal = [
  {
    marker: "$5",
    title: "Tokens on us",
    body: "A code worth $5 in arcade credit, sent the second you sign up. Spend it on whatever is bolted to the floor; pinball, fighters, the lot.",
  },
  {
    marker: "52",
    title: "A useful list",
    body: "New machines, Pinball Night, tournaments, and the odd reason to come in on a Tuesday. Short emails. Machine names. No filler.",
  },
  {
    marker: "7d",
    title: "The catch",
    body: "The code is good for seven days. After that it turns back into a pumpkin. We will not chase you; but the Godzilla LE is not going to play itself.",
  },
];

const steps = [
  {
    n: "1",
    title: "Hand over an email",
    body: "Name and email in the box. Takes about as long as racking up a credit.",
  },
  {
    n: "2",
    title: "Get your code",
    body: "We email you a unique code worth $5 in tokens, plus its expiry date. A screenshot is fine.",
  },
  {
    n: "3",
    title: "Show it at the bar",
    body: "Flash the code within seven days. We load your tokens. You go and lose to Dave.",
  },
];

export default function TokensPage() {
  return (
    <>
      <PageHeader
        kicker="The newsletter"
        title="Five bucks in tokens. For an email address."
        lede="Sign up to the Beercade list and we'll send you $5 in arcade tokens; enough to lose a bunch of games of Street Fighter II to a stranger and call it a Thursday well spent. The list itself: what's new on the floor, when Pinball Night runs, who is holding the Pac-Man high score, and the odd reason to come in midweek. No daily emails, no filler."
      />

      {/* Signup */}
      <Section id="get-tokens" aria-labelledby="get-tokens-heading">
        <div className="grid gap-12 md:grid-cols-[1fr_440px] md:items-start">
          <div className="space-y-4">
            <h2 id="get-tokens-heading" className="t-h2 text-crema">
              Get your tokens.
            </h2>
            <p className="font-body text-crema/70">
              No velvet rope, no loyalty app, no points that expire before you
              remember you have them. Drop your details in and your code lands
              in your inbox.
            </p>
            <p className="font-body text-crema/60 text-sm">
              We email like the people who run the venue, not a brand.
              Unsubscribe whenever you like.
            </p>
          </div>

          <div className="border-tilt-purple bg-surface-raised rounded-none border p-6 md:p-7">
            <p className="t-kicker mb-1">$5 in tokens</p>
            <h3 className="t-h3 text-crema mb-5">Send it over.</h3>
            <TokenSignup />
          </div>
        </div>
      </Section>

      {/* What you're signing up for */}
      <Section tone="raised" hairline aria-labelledby="deal-heading">
        <h2 id="deal-heading" className="t-h2 text-crema">
          What you&rsquo;re actually signing up for.
        </h2>
        <p className="font-body text-crema/70 mt-3 max-w-2xl">
          Three things, that is it.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {deal.map((d) => (
            <div
              key={d.title}
              className="border-hairline bg-surface rounded-none border p-6"
            >
              <p className="font-accent text-high-score-orange text-sm">
                {d.marker}
              </p>
              <h3 className="t-h3 text-crema mt-4">{d.title}</h3>
              <p className="font-body text-crema/80 mt-2 text-sm">{d.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section hairline aria-labelledby="how-heading">
        <h2 id="how-heading" className="t-h2 text-crema">
          How it works.
        </h2>
        <p className="font-body text-crema/70 mt-3 max-w-2xl">
          Three steps. None of them involve downloading an app.
        </p>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n}>
              <span className="bg-crema font-display text-after-dark flex h-11 w-11 items-center justify-center rounded-full text-lg">
                {s.n}
              </span>
              <h3 className="t-h3 text-crema mt-4">{s.title}</h3>
              <p className="font-body text-crema/80 mt-2 text-sm">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Bottom CTA */}
      <Section tone="feature-purple" aria-labelledby="bottom-cta-heading">
        <div className="flex flex-col items-start gap-6">
          <h2 id="bottom-cta-heading" className="t-h1 text-crema max-w-3xl">
            You&rsquo;ve read this far. Just take the tokens.
          </h2>
          <CTAButton href="#get-tokens" variant="primary">
            Claim my $5 in tokens
          </CTAButton>
        </div>
      </Section>
    </>
  );
}
