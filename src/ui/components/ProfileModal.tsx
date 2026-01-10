import { X } from 'lucide-react'
import { AuthCard } from './AuthCard'

type ProfileModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
      <div
        className="relative w-full max-w-xl rounded-2xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label="Perfil"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-transparent p-1 text-[color:var(--color-text-muted)] hover:border-[color:var(--color-border-subtle)] hover:text-[color:var(--color-text-main)]"
          aria-label="Cerrar perfil"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-primary-main)]">
              Perfil
            </p>
            <h2 className="text-2xl font-semibold text-[color:var(--color-text-main)]">
              Tu cuenta de FairSplit
            </h2>
            <p className="text-sm text-[color:var(--color-text-muted)]">
              Guarda tus datos en la nube y recupera tus eventos.
            </p>
          </div>
          <AuthCard />
        </div>
      </div>
    </div>
  )
}
