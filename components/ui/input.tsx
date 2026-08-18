import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "min-h-11 w-full rounded-2xl border border-gold/20 bg-background-deep/80 px-4 text-sm text-foreground placeholder:text-muted outline-none transition focus:border-gold/60",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-2xl border border-gold/20 bg-background-deep/80 px-4 py-3 text-sm text-foreground placeholder:text-muted outline-none transition focus:border-gold/60",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label className={cn("mb-2 block text-xs uppercase tracking-[0.18em] text-gold", className)} {...props} />
  );
}
