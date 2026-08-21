const PILLARS = [
  {
    n: "01",
    title: "Visibility, not surveillance",
    body: "Turns “trust the team” into “see it happen.” Proof of execution — not a camera on the crew.",
  },
  {
    n: "02",
    title: "Speed to fix",
    body: "The automatic 30-minute window catches problems the same shift, not at close or on inspection day.",
  },
  {
    n: "03",
    title: "Audit-ready in one click",
    body: "No scrambling the night before a health inspection or franchise audit. The report is already built.",
  },
  {
    n: "04",
    title: "Pays for itself",
    body: "One empty shelf, cold bar, or spoiled cooler a week covers the subscription. The rest is margin.",
  },
] as const;

export function Pillars() {
  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">
          Why it holds
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl tracking-tight text-fg sm:text-5xl">
          Built for operators who can’t be everywhere.
        </h2>

        <div className="mt-12 grid gap-px overflow-hidden rounded-xl bg-line sm:grid-cols-2">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.n}
              className="bg-surface px-6 py-8 sm:px-8 sm:py-10"
            >
              <span className="font-display text-sm text-subtle">{pillar.n}</span>
              <h3 className="mt-4 font-display text-2xl tracking-tight text-fg">
                {pillar.title}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
                {pillar.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
