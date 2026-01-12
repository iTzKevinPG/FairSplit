import { Check, X } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface MemberChipProps {
  name: string
  isPayer?: boolean
  isSelected?: boolean
  isEditable?: boolean
  onToggle?: () => void
  onRemove?: () => void
  className?: string
}

export function MemberChip({
  name,
  isPayer,
  isSelected = true,
  isEditable = false,
  onToggle,
  onRemove,
  className,
}: MemberChipProps) {
  const content = (
    <>
      {isEditable && isSelected ? <Check className="h-3 w-3" /> : null}
      <span className="truncate">
        {name}
        {isPayer ? (
          <span className="ml-1 rounded-full border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--color-text-main)]">
            (Pagador)
          </span>
        ) : null}
      </span>
      {onRemove ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onRemove()
          }}
          className="ml-1 rounded-full p-0.5 transition-colors hover:bg-[color:var(--color-border-subtle)]"
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}
    </>
  )

  const baseClasses = cn(
    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
    isSelected
      ? isPayer
        ? 'bg-[color:var(--color-primary-main)] text-[color:var(--color-text-on-primary)]'
        : 'border border-[color:var(--color-primary-light)] bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-main)]'
      : 'border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)]',
    isEditable ? 'cursor-pointer hover:border-[color:var(--color-primary-light)]' : '',
    className,
  )

  if (isEditable && onToggle) {
    return (
      <button type="button" onClick={onToggle} className={baseClasses}>
        {content}
      </button>
    )
  }

  return <div className={baseClasses}>{content}</div>
}
