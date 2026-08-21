import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 min-h-11",
  {
    variants: {
      variant: {
        gold: "btn-brand hover:brightness-110",
        cream: "btn-brand hover:brightness-105",
        outline:
          "border border-cream/35 bg-[rgba(26,69,53,0.35)] text-cream backdrop-blur-sm hover:bg-cream/10",
        ghost: "text-foreground hover:bg-cream/5",
        dark: "bg-gradient-to-b from-[var(--forest-lift)] to-[var(--forest-deep)] text-cream hover:brightness-110",
      },
      size: {
        sm: "px-4 text-sm",
        md: "px-6 text-sm",
        lg: "px-8 text-base",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "gold",
      size: "md",
    },
  },
);

export function Button({
  className,
  variant,
  size,
  loading,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { loading?: boolean }) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
