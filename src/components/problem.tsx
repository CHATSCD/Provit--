import { CookingPot, Rows3, Snowflake } from "lucide-react";

const PAINS = [
  {
    icon: Rows3,
    n: "01",
    title: "Empty shelf",
    body: "A facing nobody restocked during the dinner rush. The guest walks. You read it later in the sales drop.",
  },
  {
    icon: CookingPot,
    n: "02",
    title: "Cold hot bar",
    body: "Protein sat below temp for two hours. You toss the pan, eat the food cost, and hope nobody got sick.",
  },
  {
    icon: Snowflake,
    n: "03",
    title: "Walk-in out of temp",
    body: "A cooler drifted overnight. By morning it’s a write-off — product, labor, and a health-code conversation.",
  },
] as const;

export function Problem() {
  return (
    <section className="border-b border-line bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">
          The cost of an unchecked shift
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl tracking-tight text-fg sm:text-4xl">
          Every night, something goes wrong on a shift you weren’t at.
        </h2>

        <div className="mt-10 grid gap-px overflow-hidden rounded-xl bg-line sm:grid-cols-3">
          {PAINS.map((pain) => (
            <article
              key={pain.n}
              className="bg-surface px-6 py-7 sm:px-7 sm:py-8"
            >
              <div className="flex items-center justify-between">
                <pain.icon
                  className="size-5 text-muted"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <span className="font-display text-sm text-subtle">{pain.n}</span>
              </div>
              <h3 className="mt-6 font-display text-2xl tracking-tight text-fg">
                {pain.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {pain.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
