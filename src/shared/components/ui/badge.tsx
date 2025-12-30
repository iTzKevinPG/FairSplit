/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/shared/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-pill border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)] focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[color:var(--color-primary-main)] text-[color:var(--color-text-on-primary)]',
        secondary: 'border-transparent bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-main)]',
        destructive: 'border-transparent bg-[color:var(--color-accent-danger)] text-[color:var(--color-text-on-primary)]',
        outline: 'text-[color:var(--color-text-main)] border-[color:var(--color-border-subtle)]',
        success: 'border-[color:var(--color-accent-success)] bg-[color:var(--color-success-bg)] text-[color:var(--color-accent-success)]',
        warning: 'border-[color:var(--color-accent-warning)] bg-[color:var(--color-warning-bg)] text-[color:var(--color-accent-warning)]',
        danger: 'border-[color:var(--color-accent-danger)] bg-[color:var(--color-danger-bg)] text-[color:var(--color-accent-danger)]',
        info: 'border-[color:var(--color-accent-info)] bg-[color:var(--color-info-bg)] text-[color:var(--color-accent-info)]',
        guest: 'border-[color:var(--color-accent-warning)] bg-[color:var(--color-warning-bg)] text-[color:var(--color-accent-warning)]',
        active: 'border-[color:var(--color-accent-success)] bg-[color:var(--color-success-bg)] text-[color:var(--color-accent-success)]',
        count: 'border-[color:var(--color-primary-light)] bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-light)] font-semibold',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
