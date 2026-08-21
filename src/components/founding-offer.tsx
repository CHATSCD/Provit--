"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FOUNDING_CAP, FOUNDING_CLOSE } from "@/lib/roi";

const UNITS = [
  { key: "days", label: "days" },
  { key: "hours", label: "hours" },
  { key: "minutes", label: "min" },
] as const;

type UnitKey = (typeof UNITS)[number]["key"];

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  closed: boolean;
}

function computeRemaining(now: number): Remaining {
  const ms = Math.max(0, FOUNDING_CLOSE.getTime() - now);
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
    closed: ms <= 0,
  };
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

const PERKS = [
  {
    title: "Locked-in launch pricing",
    body: "The rate you sign at holds for the life of the contract.",
  },
  {
    title: "Free QR kit + manager training",
    body: "Station codes, setup, and training included — no extra invoice.",
  },
  {
    title: "Priority support",
    body: "Founding accounts go to the front of the line when something needs a human.",
  },
  {
    title: "Roadmap input",
    body: "A seat at the table as we build the next stations, reports, and workflows.",
  },
] as const;

export function FoundingOffer() {
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(computeRemaining(Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const values: Record<UnitKey, string> = {
    days: remaining ? pad(remaining.days) : "—",
    hours: remaining ? pad(remaining.hours) : "—",
    minutes: remaining ? pad(remaining.minutes) : "—",
  };

  return (
    <section className="bg-paper text-ink">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-ink-muted">
              Founding cohort
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-5xl">
              First {FOUNDING_CAP} accounts. Locked-in launch pricing.
            </h2>
            <p className="mt-4 max-w-lg text-ink-soft">
              Sign before Sept 16, 2026. Keep launch pricing for the life of the
              contract. QR kit, manager training, priority support, and a seat
              at the roadmap table.
            </p>

            <div
              className="mt-8 flex gap-3"
              aria-live="polite"
              aria-label={
                remaining?.closed
                  ? "Founding pricing has closed"
                  : "Time remaining until founding pricing closes"
              }
            >
              {UNITS.map((unit, i) => (
                <div key={unit.key} className="flex items-end gap-3">
                  {i > 0 ? (
                    <span className="mb-6 font-display text-2xl text-ink-muted">
                      :
                    </span>
                  ) : null}
                  <div className="min-w-16 rounded-lg bg-paper-2 px-3 py-3 text-center sm:min-w-20 sm:px-4">
                    <div className="font-display text-3xl tabular-nums leading-none tracking-tight text-ink sm:text-4xl">
                      {values[unit.key]}
                    </div>
                    <div className="mt-2 text-xs uppercase tracking-widest text-ink-muted">
                      {unit.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm text-ink-muted">
              {remaining?.closed
                ? "Founding pricing has closed. Run the numbers anyway — we’ll honor a conversation."
                : "Live countdown to Sept 16, 2026."}
            </p>

            <div className="mt-8">
              <Button asChild size="lg" variant="dark">
                <a href="#roi">
                  Get your number
                  <ArrowRight className="size-4" />
                </a>
              </Button>
            </div>
          </div>

          <ul className="divide-y divide-ink/10 border-t border-ink/10">
            {PERKS.map((perk) => (
              <li key={perk.title} className="py-5">
                <p className="font-medium text-ink">{perk.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {perk.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
