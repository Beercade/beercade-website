import { Suspense } from "react";
import Standings from "@/components/league/Standings";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";

// /league — the public ladder page (Run of Show §5).
// Standings come live from Match Play; revalidate every 90s. Match Play is the
// source of truth for scores — nothing here is editable in Sanity.

export const revalidate = 90;

export const metadata = {
  title: "Beercade League — Standings",
  description: "Live ladder for the Beercade pinball league.",
};

const SEASON_ID = Number(process.env.MATCHPLAY_SERIES_ID ?? process.env.MATCHPLAY_TOURNAMENT_ID);
const SEASON_SCOPE: "tournaments" | "series" = process.env.MATCHPLAY_SERIES_ID
  ? "series"
  : "tournaments";
// When showing a series ladder, player names are resolved from one of its
// tournaments. Set MATCHPLAY_TOURNAMENT_ID to any night in the series.
const PLAYER_SOURCE = process.env.MATCHPLAY_TOURNAMENT_ID
  ? Number(process.env.MATCHPLAY_TOURNAMENT_ID)
  : undefined;

export default function LeaguePage() {
  if (!Number.isFinite(SEASON_ID)) {
    return (
      <>
        <PageHeader kicker="Pinball league" title="Beercade League." />
        <Section>
          <p className="t-lede max-w-prose text-crema/70">
            The ladder goes live when the season opens. Signup link in our bio.
          </p>
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        kicker="Pinball league"
        title="Beercade League."
        lede="Best two of three qualifying nights. Top eight play the finals."
      />
      <Section aria-label="Standings">
        <Suspense
          fallback={<p className="font-body text-crema/60">Loading the ladder…</p>}
        >
          <Standings
            id={SEASON_ID}
            scope={SEASON_SCOPE}
            playerSourceTournamentId={PLAYER_SOURCE}
            highlightCut={8}
          />
        </Suspense>
      </Section>
    </>
  );
}
