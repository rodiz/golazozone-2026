import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--primary)] text-white",
        accent: "bg-[var(--accent)] text-[#0F1117]",
        success: "bg-green-500/20 text-green-400 border border-green-500/30",
        danger: "bg-red-500/20 text-red-400 border border-red-500/30",
        warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
        muted: "bg-[var(--border)] text-[var(--text-secondary)]",
        live: "bg-red-500 text-white pulse-live",
        pending: "bg-green-500/20 text-green-400 border border-green-500/30",
        locked: "bg-red-500/20 text-red-400 border border-red-500/30",
        finished: "bg-[var(--border)] text-[var(--text-secondary)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
