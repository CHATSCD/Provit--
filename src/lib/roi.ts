export type PlanId = "starter" | "pro" | "proPlus";
export type Billing = "monthly" | "annual";

export const PLANS: Record<
  PlanId,
  { monthly: number; annual: number; label: string; blurb: string }
> = {
  starter: {
    monthly: 79,
    annual: 69,
    label: "Starter",
    blurb: "Testing the system",
  },
  pro: {
    monthly: 149,
    annual: 129,
    label: "Pro",
    blurb: "Most operators",
  },
  proPlus: {
    monthly: 249,
    annual: 209,
    label: "Pro+",
    blurb: "Multi-location + coaching",
  },
};

export const PLAN_ORDER: PlanId[] = ["starter", "pro", "proPlus"];

export interface RoiInputs {
  company: string;
  contact: string;
  plan: PlanId;
  billing: Billing;
  locations: number;
  hotCaseHourlySales: number;
  hoursEmptyPerWeek: number;
  stationRecoveryPct: number;
  hoursPerWeek: number;
  recoveryPct: number;
  hourlyCost: number;
  weeksPerYear: number;
  complaintsPrevented: number;
  costPerComplaint: number;
  auditValue: number;
}

export const DEFAULT_INPUTS: RoiInputs = {
  company: "",
  contact: "",
  plan: "pro",
  billing: "monthly",
  locations: 1,
  hotCaseHourlySales: 60,
  hoursEmptyPerWeek: 3,
  stationRecoveryPct: 40,
  hoursPerWeek: 5,
  recoveryPct: 60,
  hourlyCost: 35,
  weeksPerYear: 50,
  complaintsPrevented: 8,
  costPerComplaint: 400,
  auditValue: 2000,
};

export interface RoiResult {
  monthlyRate: number;
  annualCost: number;
  protectedSales: number;
  managerSavings: number;
  complaintBenefit: number;
  auditBenefit: number;
  totalBenefits: number;
  netBenefit: number;
  roi: number;
  paybackMonths: number;
  under3: boolean;
  halfPaybackMonths: number;
}

export function monthlyRate(plan: PlanId, billing: Billing): number {
  return billing === "annual" ? PLANS[plan].annual : PLANS[plan].monthly;
}

export function calculateRoi(i: RoiInputs): RoiResult {
  const rate = monthlyRate(i.plan, i.billing);
  const annualCost = rate * 12 * Math.max(1, i.locations);
  const protectedSales =
    Math.max(0, i.hotCaseHourlySales) *
    Math.max(0, i.hoursEmptyPerWeek) *
    Math.max(0, i.weeksPerYear) *
    (Math.max(0, i.stationRecoveryPct) / 100);
  const managerSavings =
    Math.max(0, i.hoursPerWeek) *
    (Math.max(0, i.recoveryPct) / 100) *
    Math.max(0, i.hourlyCost) *
    Math.max(0, i.weeksPerYear);
  const complaintBenefit =
    Math.max(0, i.complaintsPrevented) * Math.max(0, i.costPerComplaint);
  const auditBenefit = Math.max(0, i.auditValue);
  const totalBenefits =
    protectedSales + managerSavings + complaintBenefit + auditBenefit;
  const netBenefit = totalBenefits - annualCost;
  const roi = annualCost > 0 ? netBenefit / annualCost : 0;
  const paybackMonths =
    totalBenefits > 0 ? (annualCost / totalBenefits) * 12 : Number.POSITIVE_INFINITY;
  const halfPaybackMonths =
    totalBenefits > 0
      ? (annualCost / (totalBenefits / 2)) * 12
      : Number.POSITIVE_INFINITY;

  return {
    monthlyRate: rate,
    annualCost,
    protectedSales,
    managerSavings,
    complaintBenefit,
    auditBenefit,
    totalBenefits,
    netBenefit,
    roi,
    paybackMonths,
    under3: paybackMonths < 3,
    halfPaybackMonths,
  };
}

export function money(n: number, digits = 0): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

export function monthsLabel(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n < 1) {
    const days = Math.max(1, Math.round(n * 30));
    return `${days} day${days === 1 ? "" : "s"}`;
  }
  const rounded = n < 10 ? Math.round(n * 10) / 10 : Math.round(n);
  return `${rounded} month${rounded === 1 ? "" : "s"}`;
}

export function roiPercent(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `${Math.round(n * 100).toLocaleString("en-US")}%`;
}

export const FOUNDING_CLOSE = new Date("2026-09-16T23:59:59-05:00");
export const FOUNDING_CAP = 20;

export const STEPS = [
  { id: 1, label: "Operation", short: "You" },
  { id: 2, label: "Stations", short: "Sales" },
  { id: 3, label: "Manager time", short: "Time" },
  { id: 4, label: "Standards", short: "Risk" },
] as const;
