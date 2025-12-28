interface AmountDisplayProps {
  amount: number
  currency: string
  showSign?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AmountDisplay({
  amount,
  currency,
  showSign = true,
  size = 'md',
  className,
}: AmountDisplayProps) {
  const isPositive = amount > 0
  const isNegative = amount < 0
  const absAmount = Math.abs(amount)

  const formatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absAmount)

  const sizeClass =
    size === 'lg' ? 'text-lg' : size === 'sm' ? 'text-sm' : 'text-base'

  const toneClass = showSign
    ? isPositive
      ? 'text-[color:var(--color-accent-success)]'
      : isNegative
        ? 'text-[color:var(--color-accent-danger)]'
        : 'text-[color:var(--color-text-muted)]'
    : 'text-[color:var(--color-text-main)]'

  return (
    <span className={`font-semibold tabular-nums ${sizeClass} ${toneClass} ${className ?? ''}`}>
      {showSign && isPositive ? '+ ' : ''}
      {showSign && isNegative ? '- ' : ''}
      {currency} {formatted}
    </span>
  )
}
