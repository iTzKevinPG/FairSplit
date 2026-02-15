/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium ring-offset-[color:var(--color-app-bg)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-focus-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--color-primary-main)] text-[color:var(--color-text-on-primary)] hover:bg-[color:var(--color-primary-dark)] active:scale-[0.98] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
        destructive:
          "bg-[color:var(--color-accent-danger)] text-[color:var(--color-text-on-primary)] hover:bg-[color:var(--color-accent-danger)]/90 active:scale-[0.98]",
        outline:
          "border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] text-[color:var(--color-text-main)] hover:border-[color:var(--color-primary-light)] shadow-[var(--shadow-sm)]",
        secondary:
          "bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-main)] hover:bg-[color:var(--color-surface-muted)]/80",
        ghost: "btn-ghost",
        link: "text-[color:var(--color-primary-main)] underline-offset-4 hover:underline",
        success:
          "bg-[color:var(--color-accent-success)] text-[color:var(--color-text-on-primary)] hover:bg-[color:var(--color-accent-success)]/90 active:scale-[0.98]",
        soft:
          "bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-main)] hover:bg-[color:var(--color-primary-soft)]/80 border border-[color:var(--color-primary-main)]/20",
        coral:
          "bg-[color:var(--color-accent-coral)] text-white hover:bg-[color:var(--color-accent-coral)]/90 active:scale-[0.98] shadow-[var(--shadow-sm)]",
        lila:
          "bg-[color:var(--color-accent-lila)] text-white hover:bg-[color:var(--color-accent-lila)]/90 active:scale-[0.98] shadow-[var(--shadow-sm)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-[var(--radius-md)] px-3 text-sm",
        lg: "h-11 rounded-[var(--radius-md)] px-6 text-base",
        xl: "h-12 rounded-[var(--radius-md)] px-8 text-base font-semibold",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
