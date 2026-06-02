import { CTAButton } from "@/components/ui/CTAButton";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center gap-6 py-24 text-center">
      <p className="font-accent text-xs text-high-score-orange">404</p>
      <h1 className="t-h1 text-crema">This page is out of order.</h1>
      <p className="t-lede text-crema/70">
        The bar is not. Try Machines or What&rsquo;s On.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <CTAButton href="/machines" variant="primary">
          Machines
        </CTAButton>
        <CTAButton href="/whats-on" variant="secondary">
          What&rsquo;s on
        </CTAButton>
      </div>
    </Container>
  );
}
