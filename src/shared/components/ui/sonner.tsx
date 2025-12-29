import { useTheme } from "@/shared/hooks/useTheme";
import * as React from "react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:border-[color:var(--color-border-subtle)] group-[.toaster]:bg-[color:var(--color-surface-card)] group-[.toaster]:text-[color:var(--color-text-main)] group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-[color:var(--color-text-muted)]",
          actionButton:
            "group-[.toast]:bg-[color:var(--color-primary-main)] group-[.toast]:text-[color:var(--color-text-on-primary)]",
          cancelButton:
            "group-[.toast]:bg-[color:var(--color-surface-muted)] group-[.toast]:text-[color:var(--color-text-main)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
