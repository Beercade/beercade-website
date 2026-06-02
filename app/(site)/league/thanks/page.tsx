import Link from "next/link";
import { Container } from "@/components/ui/Container";

// Where Square redirects after a completed checkout. This is UX only — the
// webhook is what actually confirms payment, so don't assert "you're paid"
// with certainty here; the confirmation email does that once the webhook lands.

export const metadata = { title: "You're in — Beercade League Finals" };

export default function FinalsThanksPage() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center gap-6 py-24 text-center">
      <p className="font-accent text-xs text-high-score-orange">You&apos;re in.</p>
      <h1 className="t-h1 text-crema">Spot reserved.</h1>
      <p className="t-lede max-w-md text-crema/70">
        Thanks — we&apos;ll email your confirmation shortly. Doors at 6:30, first
        ball at 7. Bring ID; it&apos;s an 18+ night.
      </p>
      <Link
        href="/league"
        className="font-body text-sm text-crema underline underline-offset-4 decoration-hairline transition-colors hover:decoration-high-score-orange"
      >
        Back to the ladder
      </Link>
    </Container>
  );
}
