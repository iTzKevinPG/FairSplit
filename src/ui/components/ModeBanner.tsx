import { Cloud, User } from 'lucide-react'
import { useMemo } from 'react'
import { useAuthStore } from '../../shared/state/authStore'

export function ModeBanner() {
  const token = useAuthStore((state) => state.token)
  const email = useAuthStore((state) => state.email)

  const { title, message, tone } = useMemo(() => {
    if (token) {
      return {
        title: 'Perfil activo',
        message: `Guardando en la nube para ${email || 'tu cuenta'}.`,
        tone: 'success',
      }
    }
    return {
      title: 'Modo invitado',
      message: 'Los datos se guardan solo en esta sesion (se pierden al recargar).',
      tone: 'warning',
    }
  }, [token, email])

  const toneClasses =
    tone === 'success'
      ? 'border-[color:var(--color-accent-success)] bg-[color:var(--color-success-bg)]'
      : 'border-[color:var(--color-accent-warning)] bg-[color:var(--color-warning-bg)]'

  return (
    <div
      className={`flex flex-col gap-2 rounded-md border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between ${toneClasses}`}
    >
      <div className="flex items-center gap-2 font-semibold text-[color:var(--color-text-main)]">
        {tone === 'success' ? (
          <Cloud className="h-4 w-4 text-[color:var(--color-accent-success)]" />
        ) : (
          <User className="h-4 w-4 text-[color:var(--color-accent-warning)]" />
        )}
        <span>{title}</span>
      </div>
      <div className="text-[color:var(--color-text-muted)] sm:text-right">
        {message}
      </div>
    </div>
  )
}
