import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 min-h-11",
  {
    variants: {
      variant: {
        gold: "bg-gold text-primary-foreground hover:brightness-110",
        cream: "bg-cream text-primary-foreground hover:bg-cream-light",
        outline:
          "border border-gold/40 bg-transparent text-foreground hover:bg-gold/10",
        ghost: "text-foreground hover:bg-white/5",
        dark: "bg-background-deep text-foreground hover:bg-background",
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
