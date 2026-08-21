import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";

const leadSchema = z.object({
  company: z.string().trim().min(1).max(160),
  contact: z.string().trim().max(160).default(""),
  email: z.string().trim().email().max(180),
  plan: z.enum(["starter", "pro", "proPlus"]),
  paybackMonths: z.number().finite(),
  roi: z.number().finite(),
  netBenefit: z.number().finite(),
  annualCost: z.number().finite(),
  totalBenefits: z.number().finite(),
});

export const submitRoiLead = createServerFn({ method: "POST" })
  .validator((input: unknown) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`
      insert into roi_leads (
        company, contact, email, plan,
        payback_months, roi, net_benefit, annual_cost, total_benefits
      ) values (
        ${data.company},
        ${data.contact},
        ${data.email},
        ${data.plan},
        ${data.paybackMonths},
        ${data.roi},
        ${data.netBenefit},
        ${data.annualCost},
        ${data.totalBenefits}
      )
    `;
    return { ok: true as const };
  });

export const getFoundingTaken = createServerFn({ method: "GET" }).handler(
  async () => {
    const sql = await getSql();
    const rows = await sql<{ n: number }>`
      select count(*)::int as n from roi_leads
    `;
    return { taken: rows[0]?.n ?? 0 };
  },
);
