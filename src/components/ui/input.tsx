import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-ink/5 px-3 text-base text-ink outline-none transition-[box-shadow] duration-150 placeholder:text-ink-muted/70 focus-visible:shadow-[0_0_0_2px_var(--color-ink)] md:text-sm",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
