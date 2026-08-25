import { Link } from "@tanstack/react-router";
import { authEnabled } from "@/lib/auth/client";
import { Mark } from "@/components/mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <Mark className="size-6" />
            <span className="font-display text-lg text-fg">
              ProveIt<sup>&trade;</sup>
            </span>
          </div>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Task verification for multi-unit foodservice. Proof, not a shift
            report.
          </p>
          <p className="mt-4 text-xs text-subtle">
            &copy; {new Date().getFullYear()} ProveIt. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
          <a href="#how" className="hover:text-fg">
            How it works
          </a>
          <a href="#roi" className="hover:text-fg">
            ROI calculator
          </a>
          <a href="#pricing" className="hover:text-fg">
            Pricing
          </a>
          {authEnabled ? (
            <Link to="/login" className="hover:text-fg">
              Sign in
            </Link>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
