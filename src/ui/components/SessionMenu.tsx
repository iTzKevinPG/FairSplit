import { ArrowLeft, Cloud, Menu, User, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, buttonVariants } from '../../shared/components/ui/button'
import { useAuthStore } from '../../shared/state/authStore'
import { ThemeToggle } from './ThemeToggle'

type SessionMenuProps = {
  isOpen: boolean
  onClose: () => void
  onOpenProfile: () => void
  backLink?: { href: string; label: string }
}

function useSessionStatus() {
  const { token, email } = useAuthStore()
  const isAuthenticated = Boolean(token)
  const statusLabel = isAuthenticated ? 'Sesion activa' : 'Modo local'
  const statusMessage = isAuthenticated
    ? `Guardando en la nube para ${email || 'tu cuenta'}.`
    : 'Los datos se guardan en este dispositivo y se pierden solo si limpias el almacenamiento.'
  const statusBorder = isAuthenticated
    ? 'border-[color:var(--color-accent-success)]'
    : 'border-[color:var(--color-accent-warning)]'
  const statusBg = isAuthenticated
    ? 'bg-[color:var(--color-success-bg)]'
    : 'bg-[color:var(--color-warning-bg)]'
  const menuIconClass = isAuthenticated
    ? 'text-[color:var(--color-accent-success)]'
    : 'text-[color:var(--color-accent-warning)]'
  const statusIcon = isAuthenticated ? (
    <Cloud className="h-4 w-4 text-[color:var(--color-accent-success)]" />
  ) : (
    <User className="h-4 w-4 text-[color:var(--color-accent-warning)]" />
  )

  return {
    isAuthenticated,
    statusLabel,
    statusMessage,
    statusBorder,
    statusBg,
    menuIconClass,
    statusIcon,
  }
}

export function SessionStatusPill() {
  const { isAuthenticated, statusBorder, statusBg, statusIcon } = useSessionStatus()
  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-2 py-1 text-xs font-semibold text-[color:var(--color-text-main)] sm:px-3 ${statusBorder} ${statusBg}`}
      data-tour="session-status"
    >
      {statusIcon}
      <span className="hidden md:inline">{isAuthenticated ? 'Nube' : 'Local'}</span>
    </div>
  )
}

export function SessionMenuButton({ onClick }: { onClick: () => void }) {
  const { statusBorder, menuIconClass } = useSessionStatus()
  return (
    <button
      type="button"
      className={`flex h-9 w-9 items-center justify-center rounded-full border text-[color:var(--color-text-main)] ${statusBorder}`}
      onClick={onClick}
      aria-label="Abrir menu"
      data-tour="menu-button"
    >
      <Menu className={`h-4 w-4 ${menuIconClass}`} />
    </button>
  )
}

export function SessionMenu({ isOpen, onClose, onOpenProfile, backLink }: SessionMenuProps) {
  const { statusLabel, statusMessage, statusBorder, statusBg, statusIcon } =
    useSessionStatus()

  return (
    <div
      className={`fixed inset-0 z-40 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      <div
        className={`absolute inset-x-0 bottom-0 top-16 bg-black/40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-16 flex h-[calc(100%-4rem)] w-[85%] max-w-xs flex-col gap-6 border-l border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-6 shadow-lg transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
            Menu
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-transparent p-1 text-[color:var(--color-text-muted)] hover:border-[color:var(--color-border-subtle)] hover:text-[color:var(--color-text-main)]"
            aria-label="Cerrar menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className={`rounded-xl border ${statusBorder} ${statusBg} p-4`}>
          <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--color-text-main)]">
            {statusIcon}
            {statusLabel}
          </div>
          <p className="mt-2 text-xs text-[color:var(--color-text-muted)]">
            {statusMessage}
          </p>
        </div>

        <div className="space-y-3">
          <Button type="button" variant="outline" onClick={onOpenProfile}>
            {statusIcon}
            Gestionar perfil
          </Button>
          {backLink ? (
            <Link
              to={backLink.href}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              <ArrowLeft className="h-4 w-4" />
              {backLink.label}
            </Link>
          ) : null}
          <ThemeToggle showLabelOnMobile />
        </div>
      </div>
    </div>
  )
}
