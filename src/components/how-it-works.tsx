const STEPS = [
  {
    n: "01",
    title: "Scan the station QR",
    body: "Every hot bar, walk-in, stockroom, and prep line gets a code. The check starts where the work happens — not on a clipboard in the office.",
  },
  {
    n: "02",
    title: "Submit a live, geotagged photo",
    body: "Timestamped and on-site. No backdating. No photo from last Tuesday. If they weren’t there, it doesn’t count.",
  },
  {
    n: "03",
    title: "Scheduled and random checks",
    body: "Part of the cadence is fixed. Part is unannounced — so nobody performs for the clock.",
  },
  {
    n: "04",
    title: "30-minute fix window on a miss",
    body: "Anything that falls short opens a clock automatically. Problems get caught mid-shift, not at close.",
  },
  {
    n: "05",
    title: "One-click audit report",
    body: "Every check rolls up for health inspectors, franchise auditors, or internal ops. Ready the moment they walk in.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 border-b border-line bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">
          How it works
        </p>
        <h2 className="mt-3 max-w-xl font-display text-3xl tracking-tight text-fg sm:text-5xl">
          Proof, not a shift report.
        </h2>
        <p className="mt-4 max-w-lg text-muted">
          Five steps. No extra app for the crew to remember — scan, shoot, done.
          Misses fix themselves on a timer.
        </p>

        <ol className="mt-12 divide-y divide-line border-t border-line">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="grid gap-2 py-8 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:items-baseline sm:gap-10"
            >
              <span className="font-display text-3xl leading-none text-subtle">
                {step.n}
              </span>
              <div>
                <h3 className="font-display text-2xl tracking-tight text-fg">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
