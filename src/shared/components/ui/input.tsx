import * as React from "react";

import { cn } from "@/shared/utils/cn";

export interface InputProps extends React.ComponentProps<"input"> {
  error?: boolean;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-all duration-200",
            "bg-[color:var(--color-surface-input)] text-[color:var(--color-text-main)] shadow-[var(--shadow-sm)]",
            "ring-offset-[color:var(--color-app-bg)]",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[color:var(--color-text-main)]",
            "placeholder:text-[color:var(--color-text-muted)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-focus-ring)] focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-[color:var(--color-accent-danger)] focus-visible:ring-[color:var(--color-accent-danger)]"
              : "border-[color:var(--color-border-subtle)] hover:border-[color:var(--color-primary-light)]",
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && (
          <p className={cn("mt-1.5 text-xs", error ? "text-danger" : "text-muted-foreground")}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
