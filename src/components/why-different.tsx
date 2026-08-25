import { Check, X } from "lucide-react";
import { cn } from "@/lib/cn";

type Cell = { text: string; good?: boolean; bad?: boolean };

const ROWS: { label: string; paper: Cell; app: Cell; proveit: Cell }[] = [
  {
    label: "Proof it happened",
    paper: { text: "A signature — trust the crew’s word", bad: true },
    app: { text: "A tap — still just trust, digitized", bad: true },
    proveit: {
      text: "Live, geotagged photo — timestamped on-site",
      good: true,
    },
  },
  {
    label: "When a miss gets caught",
    paper: { text: "Whenever someone reads the binder — often never", bad: true },
    app: { text: "Never — a checked box doesn’t flag anything", bad: true },
    proveit: {
      text: "Automatically — a 30-minute fix window opens on the spot",
      good: true,
    },
  },
  {
    label: "What the crew has to do",
    paper: { text: "Carry a clipboard, remember to fill it out", bad: true },
    app: { text: "Download an app, make a login, remember a password", bad: true },
    proveit: { text: "Scan the station QR code — nothing to install", good: true },
  },
  {
    label: "Audit or inspection day",
    paper: { text: "Dig through binders the night before", bad: true },
    app: { text: "Export a report and hope it’s complete", bad: true },
    proveit: {
      text: "Already built — one click, backed by real photos",
      good: true,
    },
  },
] as const;

function Mark({ cell }: { cell: Cell }) {
  return (
    <span className="flex items-start gap-2">
      {cell.good ? (
        <Check className="mt-0.5 size-4 shrink-0 text-good" strokeWidth={2.5} aria-hidden />
      ) : (
        <X className="mt-0.5 size-4 shrink-0 text-subtle" strokeWidth={2} aria-hidden />
      )}
      <span>{cell.text}</span>
    </span>
  );
}

export function WhyDifferent() {
  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">
          Why ProveIt
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl tracking-tight text-fg sm:text-5xl">
          It’s not a fancier checklist. It’s proof.
        </h2>
        <p className="mt-4 max-w-2xl text-muted">
          Paper clipboards and digital checklist apps have the same blind
          spot: they prove someone tapped a box, not that the work got done.
          ProveIt proves the work itself.
        </p>

        <div className="mt-10 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <caption className="sr-only">
              Comparison of paper checklists, digital checklist apps, and
              ProveIt
            </caption>
            <thead>
              <tr className="border-b border-line bg-surface">
                <th scope="col" className="w-1/4 px-5 py-4 font-medium text-muted">
                  <span className="sr-only">Category</span>
                </th>
                <th scope="col" className="w-1/4 px-5 py-4 font-medium text-muted">
                  Paper checklist
                </th>
                <th scope="col" className="w-1/4 px-5 py-4 font-medium text-muted">
                  Digital checklist app
                </th>
                <th
                  scope="col"
                  className="w-1/4 rounded-t-lg bg-raised px-5 py-4 font-display text-base tracking-tight text-fg ring-1 ring-inset ring-accent"
                >
                  ProveIt
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr
                  key={row.label}
                  className={cn(
                    "border-line",
                    i < ROWS.length - 1 && "border-b",
                  )}
                >
                  <th
                    scope="row"
                    className="px-5 py-5 align-top font-medium text-fg"
                  >
                    {row.label}
                  </th>
                  <td className="px-5 py-5 align-top text-muted">
                    <Mark cell={row.paper} />
                  </td>
                  <td className="px-5 py-5 align-top text-muted">
                    <Mark cell={row.app} />
                  </td>
                  <td
                    className={cn(
                      "bg-raised px-5 py-5 align-top text-fg ring-1 ring-inset ring-accent",
                      i === ROWS.length - 1 && "rounded-b-lg",
                    )}
                  >
                    <Mark cell={row.proveit} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
