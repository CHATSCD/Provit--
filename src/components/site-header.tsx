import { Link } from "@tanstack/react-router";
import { authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { UserButton } from "@/lib/auth/gates";
import { Button } from "@/components/ui/button";
import { Mark } from "@/components/mark";

function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (!authEnabled) return null;
  if (isPending) {
    return (
      <div
        className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-fg/10"
        aria-hidden
      />
    );
  }
  if (!user) {
    return (
      <Link
        to="/login"
        className="inline-flex h-9 items-center rounded-md px-3 text-sm text-muted transition-colors duration-150 hover:text-fg"
      >
        Sign in
      </Link>
    );
  }
  return (
    <div className="hidden text-fg sm:block">
      <UserButton />
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-fg"
          aria-label="ProveIt home"
        >
          <Mark className="size-7" />
          <span className="font-display text-xl tracking-tight">ProveIt</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <a href="#how" className="transition-colors hover:text-fg">
            How it works
          </a>
          <a href="#roi" className="transition-colors hover:text-fg">
            ROI
          </a>
          <a href="#pricing" className="transition-colors hover:text-fg">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <AuthSlot />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href="#roi">Get your number</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
