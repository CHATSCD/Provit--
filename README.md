# ProveIt

High-converting landing page and ROI calculator for ProveIt — task-verification software for multi-unit restaurant and grocery operators.

**Prove every station. Every shift.**

## What this is

Prospects answer discovery questions first (sales, manager time, complaints, audits), hit submit, and see payback months, ROI, and a benefit breakdown. Founding-cohort pricing is locked for the first 20 accounts through September 16, 2026.

## Stack

React 19, TanStack Start, Tailwind v4, Better Auth (Google / X).

## Scripts

```bash
npm install
npm run dev      # local preview
npm run build
npm run typecheck
```

## Pricing (per location)

| Plan    | Monthly | Annual |
| ------- | ------- | ------ |
| Starter | $79     | $69    |
| Pro     | $149    | $129   |
| Pro+    | $249    | $209   |

## Deploying under a subpath (multi-zone)

To mount this app under another domain's path (e.g. `prov-it.net/retail`
rewriting to this deployment) instead of a domain root, set `VITE_BASE_PATH`
at build time:

```bash
VITE_BASE_PATH=/retail npm run build
```

This drives Vite's `base`, TanStack Start's router basepath, and nitro's
`baseURL` together, so every route, asset link, and the generated Vercel
routing config stay consistently prefixed. Leave it unset to build at `/`
as normal. Pair with `VITE_AUTH_ENABLED=false` to drop the login UI for a
subpath mount that doesn't need its own accounts.
