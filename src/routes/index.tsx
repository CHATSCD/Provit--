import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/hero";
import { Problem } from "@/components/problem";
import { WhyDifferent } from "@/components/why-different";
import { RoiCalculator } from "@/components/roi-calculator";
import { HowItWorks } from "@/components/how-it-works";
import { Pillars } from "@/components/pillars";
import { FoundingOffer } from "@/components/founding-offer";
import { Pricing } from "@/components/pricing";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <SiteHeader />
      <main>
        <Hero />
        <Problem />
        <WhyDifferent />
        <section id="roi" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted">ROI calculator</p>
            <h2 className="mt-3 font-display text-4xl text-fg sm:text-5xl">Answer a few questions. See the payback.</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">Fill in the yellow-cell questions from a discovery call. Hit submit. We'll show payback months first — operators care more about speed than a vanity ROI %.</p>
          </div>
          <div className="mx-auto mt-10 max-w-3xl">
            <RoiCalculator />
          </div>
        </section>
        <HowItWorks />
        <Pillars />
        <FoundingOffer />
        <Pricing />
      </main>
      <SiteFooter />
    </div>
  );
}
