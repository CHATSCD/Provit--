import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { money, PLAN_ORDER, PLANS, type PlanId } from "@/lib/roi";

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-20 bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">
          Pricing
        </p>
        <h2 className="mt-3 max-w-xl font-display text-3xl tracking-tight text-fg sm:text-5xl">
          Simple, per location.
        </h2>
        <p className="mt-4 max-w-lg text-muted">
          Monthly, or about 15% less billed annually. Same product — pick the
          cadence that matches how you buy.
        </p>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {PLAN_ORDER.map((id) => (
            <PlanCard key={id} id={id} />
          ))}
        </div>

        <p className="mt-8 text-sm text-subtle">
          All prices are per location. Annual is billed monthly at the reduced
          rate after a twelve-month commitment.
        </p>
      </div>
    </section>
  );
}

function PlanCard({ id }: { id: PlanId }) {
  const plan = PLANS[id];
  const featured = id === "pro";
  const annualSave = (plan.monthly - plan.annual) * 12;

  return (
    <article
      className={cn(
        "relative flex flex-col rounded-xl p-6 sm:p-8",
        featured
          ? "bg-raised shadow-dark ring-1 ring-accent"
          : "border border-line bg-surface",
      )}
    >
      {featured ? (
        <p className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-fg">
          Recommended
        </p>
      ) : null}

      <p className="font-display text-2xl tracking-tight text-fg">{plan.label}</p>
      <p className="mt-4 text-xs font-medium uppercase tracking-widest text-muted">
        Best for
      </p>
      <p className="mt-1 text-fg">{plan.blurb}</p>

      <div className="mt-8">
        <p className="flex items-baseline gap-1">
          <span className="font-display text-5xl leading-none tracking-tight text-fg">
            {money(plan.monthly)}
          </span>
          <span className="text-sm text-muted">/ mo</span>
        </p>
        <p className="mt-2 text-sm text-muted">per location, billed monthly</p>
      </div>

      <p className="mt-6 border-t border-line pt-5 text-sm text-muted">
        <span className="text-fg">{money(plan.annual)}/mo</span> billed annually
        <span className="text-subtle"> · save {money(annualSave)}/yr</span>
      </p>

      <div className="mt-8">
        <Button
          asChild
          size="lg"
          variant={featured ? "primary" : "outline"}
          className="w-full"
        >
          <a href="#roi">
            Get your number
            <ArrowRight className="size-4" />
          </a>
        </Button>
      </div>
    </article>
  );
}
