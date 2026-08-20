import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Mark } from "@/components/mark";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="relative grid min-h-dvh place-items-center bg-bg px-4 py-16 text-fg">
      <Link
        to="/"
        className="absolute left-4 top-4 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg sm:left-6 sm:top-6"
      >
        <Mark className="size-7" />
        <span className="font-display text-lg text-fg">ProveIt</span>
      </Link>

      <div className="w-full max-w-sm rounded-xl border border-line bg-surface p-8 shadow-[var(--shadow-dark)]">
        <Mark className="size-10" />
        <h1 className="mt-5 font-display text-3xl tracking-tight text-fg">
          Sign in to ProveIt
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Save reports and manage founding-cohort access.
        </p>

        <div className="mt-8 space-y-3">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => {
                  void signIn(p.providerId, { callbackURL: "/" });
                }}
              >
                Continue with {p.label}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
        </div>
      </div>
    </main>
  );
}
