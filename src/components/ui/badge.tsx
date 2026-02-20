import * as React from "react";

export type BadgeVariant =
  | "default" | "accent" | "success" | "danger" | "warning"
  | "muted" | "live" | "pending" | "locked" | "finished";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={`badge badge-${variant}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

export { Badge };
