import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
  type KeyboardEvent,
  type RefObject,
} from 'react'
import { MoreVertical } from 'lucide-react'
import { Button } from './ui/button'

type ActionItem = {
  label: string
  onClick: () => void
  icon?: ReactNode
  tone?: 'danger' | 'default'
  dataTour?: string
}

type ActionMenuProps = {
  items: ActionItem[]
  label?: string
  align?: 'left' | 'right'
  renderTrigger?: (options: {
    onClick: (event: MouseEvent<HTMLButtonElement>) => void
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
    isOpen: boolean
    ariaLabel: string
    ref: RefObject<HTMLButtonElement>
  }) => ReactNode
}

export function ActionMenu({
  items,
  label = 'Acciones',
  align = 'right',
  renderTrigger,
}: ActionMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return
    const handleOutside = (event: MouseEvent | TouchEvent) => {
      if (!menuRef.current || !triggerRef.current) return
      const target = event.target as Node
      if (!menuRef.current.contains(target) && !triggerRef.current.contains(target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [open])

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setOpen((current) => !current)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen((current) => !current)
    }
    if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      {renderTrigger ? (
        renderTrigger({
          onClick: handleClick,
          onKeyDown: handleKeyDown,
          isOpen: open,
          ariaLabel: label,
          ref: triggerRef,
        })
      ) : (
        <Button
          ref={triggerRef}
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      )}
      {open ? (
        <div
          ref={menuRef}
          className={`absolute z-[60] mt-2 w-44 rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-1 shadow-md ${
            align === 'left' ? 'left-0' : 'right-0'
          }`}
        >
          {items.map((item) => (
            <Button
              key={item.label}
              type="button"
              variant="ghost"
              size="sm"
              className={`w-full justify-start gap-2 text-sm ${
                item.tone === 'danger'
                  ? 'text-[color:var(--color-accent-danger)] hover:text-[color:var(--color-accent-danger)]'
                  : 'text-[color:var(--color-text-main)]'
              }`}
              data-tour={item.dataTour}
              onClick={() => {
                setOpen(false)
                item.onClick()
              }}
            >
              {item.icon}
              {item.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
