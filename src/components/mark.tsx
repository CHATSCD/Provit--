import { cn } from "@/lib/cn";

export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <rect width="32" height="32" rx="7" className="fill-accent" />
      <path
        d="M9 13V9h4M23 13V9h-4M9 19v4h4M23 19v4h-4"
        fill="none"
        className="stroke-accent-fg"
        strokeWidth="2"
        strokeLinecap="square"
      />
      <circle cx="16" cy="16" r="2.4" className="fill-accent-fg" />
    </svg>
  );
}
