import { ArrowRight, Check, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mark } from "@/components/mark";
import { cn } from "@/lib/cn";

const WELLS = [
  "h-5/6 bg-paper",
  "h-3/4 bg-paper-2",
  "h-full bg-good",
  "h-2/3 bg-accent",
  "h-5/6 bg-paper-2",
  "h-1/2 bg-muted",
] as const;

function HotBarWells() {
  return (
    <div className="relative bg-ink px-4 pb-3 pt-4">
      <span
        className="pointer-events-none absolute left-3 top-3 size-3 border-l-2 border-t-2 border-accent"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute right-3 top-3 size-3 border-r-2 border-t-2 border-accent"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute bottom-3 left-3 size-3 border-b-2 border-l-2 border-accent"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute bottom-3 right-3 size-3 border-b-2 border-r-2 border-accent"
        aria-hidden
      />
      <div className="grid grid-cols-3 gap-1.5">
        {WELLS.map((fill, i) => (
          <div
            key={`well-${i}`}
            className="flex aspect-[5/4] items-end rounded-sm bg-ink-soft p-0.5"
          >
            <div className={cn("w-full rounded-sm", fill)} />
          </div>
        ))}
      </div>
      <div className="mt-2.5 h-1 rounded-full bg-raised" />
    </div>
  );
}

function LiveCheckCard() {
  return (
    <div className="rounded-xl border border-line bg-raised p-2 shadow-dark">
      <div className="overflow-hidden rounded-lg bg-paper text-ink shadow-paper">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Mark className="size-5" />
            <span className="text-sm font-medium tracking-tight">ProveIt</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-good px-2 py-0.5 text-xs font-medium text-good-fg">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-good-fg opacity-60 motion-reduce:animate-none" />
              <span className="relative size-1.5 rounded-full bg-good-fg" />
            </span>
            Live check
          </div>
        </div>

        <div className="px-4 pb-3">
          <p className="text-xs font-medium uppercase tracking-widest text-ink-muted">
            Station 04
          </p>
          <p className="font-display text-3xl leading-none tracking-tight">
            Hot bar
          </p>
        </div>

        <HotBarWells />

        <div className="grid grid-cols-2 gap-3 px-4 py-4 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-ink-muted" />
            <div>
              <p className="font-medium">Geotagged</p>
              <p className="text-ink-muted">On site · 36.164° N</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 size-4 shrink-0 text-ink-muted" />
            <div>
              <p className="font-medium">14:32 CST</p>
              <p className="text-ink-muted">19 Aug 2026</p>
            </div>
          </div>
        </div>

        <div className="mx-4 mb-4 flex items-center gap-3 rounded-md bg-good px-3 py-2.5 text-good-fg">
          <Check className="size-4 shrink-0" strokeWidth={2.5} />
          <div className="text-sm leading-snug">
            <p className="font-medium">Pass</p>
            <p className="text-good-fg/80">Temps in range. Pan 3 restocked.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="border-b border-line bg-bg">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] md:gap-12 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted">
            Prove every station. Every shift.
          </p>
          <h1 className="mt-4 max-w-xl font-display text-4xl leading-none tracking-tight text-fg sm:text-5xl lg:text-6xl">
            Prove it got done. Before it costs you.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">
            Every skipped task is money walking out the door — an empty shelf, a
            cold hot bar, a cooler that drifted out of temp. ProveIt makes sure
            it never happens without you knowing.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="#roi">
                Get your number
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#how">See how it works</a>
            </Button>
          </div>
        </div>

        <aside className="hidden md:block" aria-hidden>
          <LiveCheckCard />
        </aside>
      </div>
    </section>
  );
}
