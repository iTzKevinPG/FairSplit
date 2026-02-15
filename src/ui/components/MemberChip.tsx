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


function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?'
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
      {/* Mini avatar */}
      <span className={cn(
        'flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold',
        isSelected
          ? isPayer
            ? 'bg-[color:var(--color-text-on-primary)]/20 text-[color:var(--color-text-on-primary)]'
            : 'bg-[color:var(--color-primary-main)]/15 text-[color:var(--color-primary-main)]'
          : 'bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)]'
      )}>
        {isEditable && isSelected ? <Check className="h-3 w-3" /> : getInitial(name)}
      </span>
      <span className="truncate">
        {name}
        {isPayer ? (
          <span className="ml-1 text-[9px] font-semibold opacity-75">
            💳
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
          className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-[color:var(--color-border-subtle)]"
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}
    </>
  )

  const baseClasses = cn(
    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150',
    isSelected
      ? isPayer
        ? 'bg-[color:var(--color-primary-main)] text-[color:var(--color-text-on-primary)] shadow-[var(--shadow-sm)]'
        : 'border border-[color:var(--color-primary-light)] bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-main)]'
      : 'border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)]',
    isEditable ? 'cursor-pointer hover:border-[color:var(--color-primary-light)] hover:shadow-[var(--shadow-sm)] active:scale-95' : '',
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
