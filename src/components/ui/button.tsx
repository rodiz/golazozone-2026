"use client";

import * as React from "react";

export type ButtonVariant = "primary" | "accent" | "outline" | "ghost" | "danger" | "success";
export type ButtonSize = "sm" | "md" | "lg" | "xl" | "icon";

const SIZE_STYLES: Record<ButtonSize, React.CSSProperties> = {
  sm:   { height: "2rem",    padding: "0 0.75rem", fontSize: "0.75rem"  },
  md:   { height: "2.5rem",  padding: "0 1rem",    fontSize: "0.875rem" },
  lg:   { height: "3rem",    padding: "0 1.5rem",  fontSize: "1rem"     },
  xl:   { height: "3.5rem",  padding: "0 2rem",    fontSize: "1.125rem" },
  icon: { height: "2.5rem",  width: "2.5rem",      padding: "0",        fontSize: "0.875rem" },
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={`btn btn-${variant}${className ? ` ${className}` : ""}`}
        style={{ ...SIZE_STYLES[size], ...style }}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            style={{ width: "1rem", height: "1rem", animation: "spin 1s linear infinite", flexShrink: 0 }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
            <path fill="currentColor" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

// Keep buttonVariants export for any code that imports it
export function buttonVariants({ variant = "primary", size = "md" }: { variant?: ButtonVariant; size?: ButtonSize } = {}) {
  return `btn btn-${variant}`;
}

export { Button };
