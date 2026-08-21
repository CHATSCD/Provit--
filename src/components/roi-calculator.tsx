"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Clock,
  Minus,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/cn";
import { getFoundingTaken, submitRoiLead } from "@/lib/leads";
import {
  type Billing,
  type PlanId,
  type RoiInputs,
  type RoiResult,
  DEFAULT_INPUTS,
  FOUNDING_CAP,
  FOUNDING_CLOSE,
  PLAN_ORDER,
  PLANS,
  STEPS,
  calculateRoi,
  money,
  monthlyRate,
  monthsLabel,
  roiPercent,
} from "@/lib/roi";

const STORAGE_KEY = "proveit-roi";

type StepId = (typeof STEPS)[number]["id"];

function isPlanId(v: unknown): v is PlanId {
  return v === "starter" || v === "pro" || v === "proPlus";
}

function isBilling(v: unknown): v is Billing {
  return v === "monthly" || v === "annual";
}

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function readStoredInputs(): RoiInputs {
  if (typeof sessionStorage === "undefined") return DEFAULT_INPUTS;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_INPUTS;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULT_INPUTS;
    const o = parsed as Record<string, unknown>;
    return {
      company: typeof o.company === "string" ? o.company : DEFAULT_INPUTS.company,
      contact: typeof o.contact === "string" ? o.contact : DEFAULT_INPUTS.contact,
      plan: isPlanId(o.plan) ? o.plan : DEFAULT_INPUTS.plan,
      billing: isBilling(o.billing) ? o.billing : DEFAULT_INPUTS.billing,
      locations: clamp(Math.round(num(o.locations, DEFAULT_INPUTS.locations)), 1, 50),
      annualSales: Math.max(0, num(o.annualSales, DEFAULT_INPUTS.annualSales)),
      stationPct: clamp(num(o.stationPct, DEFAULT_INPUTS.stationPct), 5, 40),
      liftPct: clamp(num(o.liftPct, DEFAULT_INPUTS.liftPct), 0.5, 5),
      hoursPerWeek: clamp(num(o.hoursPerWeek, DEFAULT_INPUTS.hoursPerWeek), 1, 20),
      recoveryPct: clamp(num(o.recoveryPct, DEFAULT_INPUTS.recoveryPct), 30, 90),
      hourlyCost: Math.max(0, num(o.hourlyCost, DEFAULT_INPUTS.hourlyCost)),
      weeksPerYear: clamp(num(o.weeksPerYear, DEFAULT_INPUTS.weeksPerYear), 1, 52),
      complaintsPrevented: Math.max(
        0,
        num(o.complaintsPrevented, DEFAULT_INPUTS.complaintsPrevented),
      ),
      costPerComplaint: Math.max(
        0,
        num(o.costPerComplaint, DEFAULT_INPUTS.costPerComplaint),
      ),
      auditValue: Math.max(0, num(o.auditValue, DEFAULT_INPUTS.auditValue)),
    };
  } catch {
    return DEFAULT_INPUTS;
  }
}

function finiteOr(n: number, fallback: number): number {
  return Number.isFinite(n) ? n : fallback;
}

function pctLabel(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return `${Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)}%`;
}

function formatClose(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    timeZone: "America/Chicago",
  });
}

function formatPrepared(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function preparedName(inputs: RoiInputs): string {
  const company = inputs.company.trim();
  const contact = inputs.contact.trim();
  return company || contact || "this location";
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function RoiCalculator() {
  const user = useCurrentUser();
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  const [inputs, setInputs] = useState<RoiInputs>(DEFAULT_INPUTS);
  const [step, setStep] = useState<StepId>(1);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<RoiResult | null>(null);
  const [preparedAt, setPreparedAt] = useState<Date | null>(null);
  const [taken, setTaken] = useState(0);
  const [email, setEmail] = useState("");
  const [leadName, setLeadName] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const skipScroll = useRef(true);
  const hydrated = useRef(false);

  const remaining = Math.max(0, FOUNDING_CAP - taken);
  const foundingOpen = Date.now() < FOUNDING_CLOSE.getTime();

  const patch = useCallback((partial: Partial<RoiInputs>) => {
    setInputs((prev) => ({ ...prev, ...partial }));
  }, []);

  useEffect(() => {
    if (!hydrated.current) {
      const stored = readStoredInputs();
      hydrated.current = true;
      setInputs(stored);
      setLeadName(stored.contact);
      return;
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
    } catch {
      /* private mode / quota */
    }
  }, [inputs]);

  useEffect(() => {
    if (!user || user.isDevFallback) return;
    setInputs((prev) => ({
      ...prev,
      contact: prev.contact.trim() ? prev.contact : (user.displayName ?? ""),
    }));
    setLeadName((prev) => prev.trim() || user.displayName || "");
    setEmail((prev) => prev.trim() || user.primaryEmail || "");
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    getFoundingTaken()
      .then((r) => {
        if (!cancelled) setTaken(r.taken);
      })
      .catch(() => {
        /* keep 0 — still show the cap */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (skipScroll.current) {
      skipScroll.current = false;
      return;
    }
    rootRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "nearest",
    });
  }, [step, submitted, reduced]);

  function goNext() {
    setStep((s) => (s < 4 ? ((s + 1) as StepId) : s));
  }

  function goBack() {
    if (submitted) {
      setSubmitted(false);
      setStep(4);
      return;
    }
    setStep((s) => (s > 1 ? ((s - 1) as StepId) : s));
  }

  function onWizardSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < 4) {
      goNext();
      return;
    }
    const next = calculateRoi(inputs);
    setResult(next);
    setPreparedAt(new Date());
    setLeadName((n) => n.trim() || inputs.contact.trim());
    setSent(false);
    setSubmitted(true);
  }

  async function onSendReport(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!result) return;
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Add an email so we can send the report.");
      return;
    }
    setSending(true);
    try {
      await submitRoiLead({
        data: {
          company: inputs.company.trim() || "this location",
          contact: leadName.trim() || inputs.contact.trim(),
          email: trimmedEmail,
          plan: inputs.plan,
          paybackMonths: finiteOr(result.paybackMonths, 120),
          roi: finiteOr(result.roi, 0),
          netBenefit: result.netBenefit,
          annualCost: result.annualCost,
          totalBenefits: result.totalBenefits,
        },
      });
      setSent(true);
      setTaken((n) => n + 1);
      toast.success("Report sent. We’ll lock founding pricing and follow up.");
    } catch {
      toast.error("Couldn’t send the report. Check the email and try again.");
    } finally {
      setSending(false);
    }
  }

  const progress = submitted ? 100 : (step / STEPS.length) * 100;
  const current = STEPS[step - 1];

  return (
    <div
      ref={rootRef}
      className="w-full min-w-0 overflow-x-hidden rounded-xl bg-paper text-ink shadow-paper"
    >
      <header className="border-b border-ink/8 px-5 py-5 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest text-ink-muted">
              ROI calculator
            </p>
            <h2 className="mt-1 font-display text-2xl tracking-tight sm:text-3xl">
              {submitted ? "Your number" : "Four questions. Then the number."}
            </h2>
          </div>
          <FoundingChip remaining={remaining} open={foundingOpen} />
        </div>

        <div className="mt-5">
          <div
            className="h-1 overflow-hidden rounded-full bg-ink/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label={submitted ? "Results" : `Step ${step} of ${STEPS.length}`}
          >
            <div
              className="h-full rounded-full bg-ink transition-[width] duration-300 ease-out motion-reduce:transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
          <ol className="mt-3 grid grid-cols-4 gap-1">
            {STEPS.map((s) => {
              const active = !submitted && s.id === step;
              const done = submitted || s.id < step;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    disabled={submitted || s.id > step}
                    onClick={() => {
                      if (!submitted && s.id < step) setStep(s.id);
                    }}
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "flex h-11 w-full min-w-0 flex-col items-start justify-center rounded-md px-1.5 text-left text-xs sm:px-2",
                      active && "text-ink",
                      done && !active && "text-ink-soft",
                      !done && !active && "text-ink-muted",
                      s.id < step && !submitted && "hover:bg-ink/5",
                    )}
                  >
                    <span className="text-[0.65rem] uppercase tracking-wider text-ink-muted tabular-nums">
                      {String(s.id).padStart(2, "0")}
                    </span>
                    <span className="w-full truncate font-medium sm:hidden">
                      {s.short}
                    </span>
                    <span className="hidden w-full truncate font-medium sm:block">
                      {s.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </header>

      {submitted && result && preparedAt ? (
        <Results
          inputs={inputs}
          result={result}
          preparedAt={preparedAt}
          reduced={reduced}
          email={email}
          leadName={leadName}
          sending={sending}
          sent={sent}
          remaining={remaining}
          foundingOpen={foundingOpen}
          onEmail={setEmail}
          onLeadName={setLeadName}
          onEdit={goBack}
          onSend={onSendReport}
        />
      ) : (
        <form onSubmit={onWizardSubmit} className="px-5 py-6 sm:px-8 sm:py-8">
          <h3 className="font-display text-xl tracking-tight sm:text-2xl">
            {current.label}
          </h3>
          {step === 1 && <StepOperation inputs={inputs} patch={patch} />}
          {step === 2 && <StepStations inputs={inputs} patch={patch} />}
          {step === 3 && <StepManager inputs={inputs} patch={patch} />}
          {step === 4 && <StepStandards inputs={inputs} patch={patch} />}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghostInk"
              size="md"
              onClick={goBack}
              disabled={step === 1}
              className={cn("min-h-11", step === 1 && "invisible")}
            >
              <ChevronLeft className="size-4" aria-hidden />
              Back
            </Button>
            <Button
              type="submit"
              variant="dark"
              size="lg"
              className="min-h-12 min-w-36 sm:min-w-44"
            >
              {step === 4 ? "See my ROI" : "Next"}
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
          <p className="mt-4 text-center text-sm text-ink-muted">
            Conservative sample numbers are filled in. Change anything — results
            stay hidden until you submit.
          </p>
        </form>
      )}
    </div>
  );
}

function FoundingChip({
  remaining,
  open,
}: {
  remaining: number;
  open: boolean;
}) {
  return (
    <p className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-ink/6 px-2.5 py-1.5 text-xs text-ink-soft">
      <Clock className="size-3.5 shrink-0" aria-hidden />
      <span className="min-w-0 leading-snug">
        {open ? (
          <>
            <span className="font-medium tabular-nums text-ink">{remaining}</span>
            {" of "}
            {FOUNDING_CAP} founding spots · closes {formatClose(FOUNDING_CLOSE)}
          </>
        ) : (
          "Founding window closed"
        )}
      </span>
    </p>
  );
}

function StepOperation({
  inputs,
  patch,
}: {
  inputs: RoiInputs;
  patch: (p: Partial<RoiInputs>) => void;
}) {
  return (
    <div className="mt-4 space-y-6">
      <p className="text-sm leading-relaxed text-ink-soft">
        Start with who you are and the plan you’d actually buy. Company is
        optional — we’ll say “this location” if you skip it.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="roi-company"
          label="Company / location"
          value={inputs.company}
          placeholder="Optional"
          autoComplete="organization"
          onChange={(v) => patch({ company: v })}
        />
        <Field
          id="roi-contact"
          label="Prepared for"
          value={inputs.contact}
          placeholder="Your name"
          autoComplete="name"
          onChange={(v) => patch({ contact: v })}
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-ink">Plan</legend>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {PLAN_ORDER.map((id) => {
            const plan = PLANS[id];
            const selected = inputs.plan === id;
            const rate = monthlyRate(id, inputs.billing);
            const annualSave = (plan.monthly - plan.annual) * 12;
            return (
              <button
                key={id}
                type="button"
                onClick={() => patch({ plan: id })}
                aria-pressed={selected}
                className={cn(
                  "min-h-11 rounded-lg p-4 text-left transition-[background-color,color] duration-150",
                  selected
                    ? "bg-ink text-accent-fg"
                    : "bg-ink/5 text-ink hover:bg-ink/8",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-lg leading-tight">
                    {plan.label}
                  </span>
                  {selected ? <Check className="size-4 shrink-0" aria-hidden /> : null}
                </div>
                <p
                  className={cn(
                    "mt-1 text-sm",
                    selected ? "text-accent-fg/70" : "text-ink-muted",
                  )}
                >
                  {plan.blurb}
                </p>
                <p className="mt-3 font-medium tabular-nums">
                  {money(rate)}
                  <span
                    className={cn(
                      "ml-1 text-sm font-normal",
                      selected ? "text-accent-fg/70" : "text-ink-muted",
                    )}
                  >
                    /mo
                  </span>
                </p>
                {inputs.billing === "annual" ? (
                  <p
                    className={cn(
                      "mt-1 text-xs tabular-nums",
                      selected ? "text-accent-fg/70" : "text-ink-muted",
                    )}
                  >
                    Save {money(annualSave)}/yr
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <fieldset>
          <legend className="text-sm font-medium text-ink">Billing</legend>
          <div className="mt-2 grid grid-cols-2 rounded-lg bg-ink/5 p-1">
            {(["monthly", "annual"] as const).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => patch({ billing: b })}
                aria-pressed={inputs.billing === b}
                className={cn(
                  "h-11 rounded-md text-sm font-medium capitalize transition-colors duration-150",
                  inputs.billing === b
                    ? "bg-ink text-accent-fg"
                    : "text-ink-soft hover:text-ink",
                )}
              >
                {b}
              </button>
            ))}
          </div>
          {inputs.billing === "annual" ? (
            <p className="mt-1.5 text-sm text-ink-muted">
              About 15% off, locked per location.
            </p>
          ) : null}
        </fieldset>

        <div>
          <Label id="roi-locations-label">Locations</Label>
          <div
            className="mt-2 flex items-center gap-3"
            role="group"
            aria-labelledby="roi-locations-label"
          >
            <button
              type="button"
              aria-label="Decrease locations"
              onClick={() =>
                patch({ locations: Math.max(1, inputs.locations - 1) })
              }
              className="flex size-11 shrink-0 items-center justify-center rounded-md bg-ink/5 text-ink hover:bg-ink/10"
            >
              <Minus className="size-4" aria-hidden />
            </button>
            <span className="min-w-8 text-center text-lg font-medium tabular-nums">
              {inputs.locations}
            </span>
            <button
              type="button"
              aria-label="Increase locations"
              onClick={() =>
                patch({ locations: Math.min(50, inputs.locations + 1) })
              }
              className="flex size-11 shrink-0 items-center justify-center rounded-md bg-ink/5 text-ink hover:bg-ink/10"
            >
              <Plus className="size-4" aria-hidden />
            </button>
            <span className="text-sm text-ink-muted">
              {inputs.locations === 1 ? "location" : "locations"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepStations({
  inputs,
  patch,
}: {
  inputs: RoiInputs;
  patch: (p: Partial<RoiInputs>) => void;
}) {
  return (
    <div className="mt-4 space-y-6">
      <p className="text-sm leading-relaxed text-ink-soft">
        Empty stations and impulse displays are the quiet leak. Stay
        conservative — you can always raise these later.
      </p>
      <MoneyField
        id="roi-sales"
        label="Annual sales of this location"
        value={inputs.annualSales}
        onChange={(n) => patch({ annualSales: n })}
      />
      <SliderField
        id="roi-station"
        label="% of sales from stations / displays / impulse"
        value={inputs.stationPct}
        min={5}
        max={40}
        step={1}
        format={pctLabel}
        hint="Typical: 10–25% of sales from stations / displays / impulse"
        onChange={(n) => patch({ stationPct: n })}
      />
      <SliderField
        id="roi-lift"
        label="Estimated lift from better-stocked stations"
        value={inputs.liftPct}
        min={0.5}
        max={5}
        step={0.5}
        format={pctLabel}
        hint="Conservative: 1–3%"
        onChange={(n) => patch({ liftPct: n })}
      />
    </div>
  );
}

function StepManager({
  inputs,
  patch,
}: {
  inputs: RoiInputs;
  patch: (p: Partial<RoiInputs>) => void;
}) {
  return (
    <div className="mt-4 space-y-6">
      <p className="text-sm leading-relaxed text-ink-soft">
        How much time does a manager spend chasing “I checked it”? We only
        count the hours you actually get back.
      </p>
      <SliderField
        id="roi-hours"
        label="Hours / week chasing checklists"
        value={inputs.hoursPerWeek}
        min={1}
        max={20}
        step={1}
        format={(n) => `${n} hr${n === 1 ? "" : "s"}`}
        hint="Typical: 3–8 hrs/week chasing checklists"
        onChange={(n) => patch({ hoursPerWeek: n })}
      />
      <SliderField
        id="roi-recovery"
        label="% of that time recovered with ProveIt"
        value={inputs.recoveryPct}
        min={30}
        max={90}
        step={1}
        format={pctLabel}
        hint="Conservative: 50–70%"
        onChange={(n) => patch({ recoveryPct: n })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyField
          id="roi-hourly"
          label="Fully loaded hourly cost"
          value={inputs.hourlyCost}
          hint="Wage + benefits + overhead"
          onChange={(n) => patch({ hourlyCost: n })}
        />
        <div>
          <Label htmlFor="roi-weeks">Weeks / year</Label>
          <Input
            id="roi-weeks"
            className="mt-1.5 tabular-nums"
            inputMode="numeric"
            value={String(inputs.weeksPerYear)}
            onChange={(e) => {
              const n = Number(e.target.value.replace(/[^0-9]/g, ""));
              patch({
                weeksPerYear: clamp(Number.isFinite(n) ? n : 0, 1, 52),
              });
            }}
          />
          <p className="mt-1.5 text-sm text-ink-muted">Default 50 — skip holidays.</p>
        </div>
      </div>
    </div>
  );
}

function StepStandards({
  inputs,
  patch,
}: {
  inputs: RoiInputs;
  patch: (p: Partial<RoiInputs>) => void;
}) {
  return (
    <div className="mt-4 space-y-6">
      <p className="text-sm leading-relaxed text-ink-soft">
        Complaints, refunds, and the scramble before an inspection. Set audit
        value to zero if you’d rather not count it.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="roi-complaints">Complaints prevented / year</Label>
          <Input
            id="roi-complaints"
            className="mt-1.5 tabular-nums"
            inputMode="numeric"
            value={String(inputs.complaintsPrevented)}
            onChange={(e) => {
              const n = Number(e.target.value.replace(/[^0-9]/g, ""));
              patch({
                complaintsPrevented: Math.max(0, Number.isFinite(n) ? n : 0),
              });
            }}
          />
          <p className="mt-1.5 text-sm text-ink-muted">
            Empty stations, dirty displays, stock issues.
          </p>
        </div>
        <MoneyField
          id="roi-complaint-cost"
          label="Cost per complaint"
          value={inputs.costPerComplaint}
          hint="Lost sale + recovery + review impact"
          onChange={(n) => patch({ costPerComplaint: n })}
        />
      </div>
      <MoneyField
        id="roi-audit"
        label="Audit / inspection readiness value"
        value={inputs.auditValue}
        hint="Set to 0 if unsure"
        onChange={(n) => patch({ auditValue: n })}
      />
    </div>
  );
}

function Results({
  inputs,
  result,
  preparedAt,
  reduced,
  email,
  leadName,
  sending,
  sent,
  remaining,
  foundingOpen,
  onEmail,
  onLeadName,
  onEdit,
  onSend,
}: {
  inputs: RoiInputs;
  result: RoiResult;
  preparedAt: Date;
  reduced: boolean;
  email: string;
  leadName: string;
  sending: boolean;
  sent: boolean;
  remaining: number;
  foundingOpen: boolean;
  onEmail: (v: string) => void;
  onLeadName: (v: string) => void;
  onEdit: () => void;
  onSend: (e: FormEvent<HTMLFormElement>) => void;
}) {
  const who = preparedName(inputs);
  const plan = PLANS[inputs.plan];
  const total = Math.max(result.totalBenefits, 1);

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      <p className="text-sm text-ink-muted">
        Prepared for {who}
        <span aria-hidden> · </span>
        {formatPrepared(preparedAt)}
      </p>

      <div className="mt-4">
        <p className="text-sm font-medium text-ink-soft">Payback period</p>
        <div aria-live="polite">
          <PaybackHero months={result.paybackMonths} reduced={reduced} />
        </div>
        <div className="mt-3">
          {result.under3 ? (
            <span className="inline-flex items-center rounded-md bg-good px-2.5 py-1 text-sm font-medium text-good-fg">
              YES — strong case
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-ink/8 px-2.5 py-1 text-sm font-medium text-ink">
              Worth a closer look
            </span>
          )}
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3">
        <Metric label="Total benefits" value={money(result.totalBenefits)} />
        <Metric label="Annual ProveIt cost" value={money(result.annualCost)} />
        <Metric label="Net annual benefit" value={money(result.netBenefit)} />
        <Metric label="ROI" value={roiPercent(result.roi)} />
      </dl>

      <div className="mt-8 space-y-4">
        <p className="text-sm font-medium text-ink">Where the benefit comes from</p>
        <BenefitBar
          label="Protected sales"
          amount={result.protectedSales}
          max={total}
          reduced={reduced}
        />
        <BenefitBar
          label="Manager time"
          amount={result.managerSavings}
          max={total}
          reduced={reduced}
        />
        <BenefitBar
          label="Complaints"
          amount={result.complaintBenefit}
          max={total}
          reduced={reduced}
        />
        <BenefitBar
          label="Audit readiness"
          amount={result.auditBenefit}
          max={total}
          reduced={reduced}
        />
      </div>

      <aside className="mt-8 rounded-lg bg-ink/5 px-4 py-4 text-sm leading-relaxed text-ink-soft">
        Even if you cut every benefit in half, payback is{" "}
        <span className="font-medium tabular-nums text-ink">
          {monthsLabel(result.halfPaybackMonths)}
        </span>
        . {plan.label}, {inputs.billing}, {inputs.locations}{" "}
        {inputs.locations === 1 ? "location" : "locations"} at{" "}
        {money(result.monthlyRate)}/mo.
      </aside>

      <div className="mt-8 border-t border-ink/8 pt-6">
        {sent ? (
          <div className="rounded-lg bg-good px-4 py-4 text-good-fg">
            <p className="font-medium">Report on its way.</p>
            <p className="mt-1 text-sm text-good-fg/90">
              We’ll follow up with founding pricing
              {foundingOpen ? ` before ${formatClose(FOUNDING_CLOSE)}` : ""}.
            </p>
          </div>
        ) : (
          <form onSubmit={onSend} className="space-y-4">
            <div>
              <p className="font-display text-xl tracking-tight">
                Send this report + lock founding pricing
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                Email is required. Name is optional if we already have it.
              </p>
            </div>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="roi-email">Work email</Label>
                <Input
                  id="roi-email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-1.5"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => onEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="roi-lead-name">Your name</Label>
                <Input
                  id="roi-lead-name"
                  autoComplete="name"
                  className="mt-1.5"
                  placeholder="Optional"
                  value={leadName}
                  onChange={(e) => onLeadName(e.target.value)}
                />
              </div>
            </div>
            <Button
              type="submit"
              variant="dark"
              size="lg"
              className="min-h-12 w-full"
              disabled={sending}
            >
              {sending ? "Sending…" : "Send this report + lock founding pricing"}
            </Button>
            {foundingOpen ? (
              <p className="text-center text-sm text-ink-muted">
                <span className="tabular-nums font-medium text-ink">{remaining}</span>{" "}
                founding {remaining === 1 ? "spot" : "spots"} left · closes{" "}
                {formatClose(FOUNDING_CLOSE)}
              </p>
            ) : null}
          </form>
        )}

        <div className="mt-4 flex justify-center">
          <Button type="button" variant="ghostInk" size="md" onClick={onEdit}>
            Edit answers
          </Button>
        </div>
      </div>
    </div>
  );
}

function PaybackHero({
  months,
  reduced,
}: {
  months: number;
  reduced: boolean;
}) {
  const finalLabel = monthsLabel(months);
  const [t, setT] = useState(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced || !Number.isFinite(months) || months < 1) {
      setT(1);
      return;
    }
    setT(0);
    const start = performance.now();
    const dur = 700;
    let id = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setT(1 - (1 - p) ** 3);
      if (p < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [months, reduced]);

  let display = finalLabel;
  if (Number.isFinite(months) && months >= 1 && t < 1) {
    const shown = months * t;
    const rounded = months < 10 ? Math.round(shown * 10) / 10 : Math.round(shown);
    display = `${rounded} month${rounded === 1 ? "" : "s"}`;
  }

  return (
    <p className="mt-1 font-display text-5xl leading-none tracking-tight sm:text-6xl">
      <span className="tabular-nums">{display}</span>
    </p>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-ink/5 px-3 py-3 sm:px-4">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="mt-1 text-lg font-medium tabular-nums tracking-tight sm:text-xl">
        {value}
      </dd>
    </div>
  );
}

function BenefitBar({
  label,
  amount,
  max,
  reduced,
}: {
  label: string;
  amount: number;
  max: number;
  reduced: boolean;
}) {
  const [on, setOn] = useState(reduced);
  useEffect(() => {
    if (reduced) {
      setOn(true);
      return;
    }
    setOn(false);
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, [amount, max, reduced]);

  const pct = max > 0 ? (amount / max) * 100 : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-ink-soft">{label}</span>
        <span className="tabular-nums text-ink">{money(amount)}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-ink transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${on ? pct : 0}%` }}
        />
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        className="mt-1.5"
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function MoneyField({
  id,
  label,
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
          $
        </span>
        <Input
          id={id}
          inputMode="decimal"
          className="pl-7 tabular-nums"
          value={focused ? draft : value.toLocaleString("en-US")}
          onFocus={() => {
            setFocused(true);
            setDraft(value === 0 ? "" : String(value));
          }}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9.]/g, "");
            setDraft(raw);
            const n = Number(raw);
            onChange(Number.isFinite(n) ? n : 0);
          }}
          onBlur={() => setFocused(false)}
        />
      </div>
      {hint ? <p className="mt-1.5 text-sm text-ink-muted">{hint}</p> : null}
    </div>
  );
}

function SliderField({
  id,
  label,
  value,
  min,
  max,
  step,
  format,
  hint,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (n: number) => string;
  hint?: string;
  onChange: (n: number) => void;
}) {
  const hintId = useId();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-sm font-medium tabular-nums text-ink">
          {format(value)}
        </span>
      </div>
      <div className="flex min-h-11 items-center">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-describedby={hint ? hintId : undefined}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
        />
      </div>
      {hint ? (
        <p id={hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
