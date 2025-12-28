import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'toggle'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-focus-ring)] ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-app-bg)] disabled:cursor-not-allowed disabled:opacity-60'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[color:var(--color-primary-main)] text-[color:var(--color-text-on-primary)] ' +
    'border border-[color:var(--color-primary-main)] hover:bg-[color:var(--color-primary-dark)]',
  outline:
    'bg-[color:var(--color-surface-card)] text-[color:var(--color-text-main)] ' +
    'border border-[color:var(--color-border-subtle)] hover:border-[color:var(--color-primary-light)]',
  ghost:
    'bg-transparent text-[color:var(--color-primary-main)] border border-transparent ' +
    'hover:bg-[color:var(--color-primary-soft)]',
  toggle:
    'rounded-full bg-[color:var(--color-surface-card)] text-[color:var(--color-text-main)] ' +
    'border border-[color:var(--color-border-subtle)] shadow-sm ' +
    'hover:border-[color:var(--color-primary-light)] hover:text-[color:var(--color-primary-main)]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
  icon: 'h-10 w-10',
}

export function buttonVariants(options?: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}) {
  const variant = options?.variant ?? 'primary'
  const size = options?.size ?? 'md'
  const className = options?.className
  return [baseClasses, variantClasses[variant], sizeClasses[size], className]
    .filter(Boolean)
    .join(' ')
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  const classes = buttonVariants({ variant, size, className })

  return <button className={classes} {...props} />
}
