import { useMemo } from 'react'
import { useAuthStore } from '../../shared/state/authStore'

export function ModeBanner() {
  const token = useAuthStore((state) => state.token)
  const email = useAuthStore((state) => state.email)

  const { title, message, tone } = useMemo(() => {
    if (Boolean(token)) {
      return {
        title: 'Perfil activo',
        message: `Guardando en la nube para ${email || 'tu cuenta'}.`,
        tone: 'success',
      }
    }
    return {
      title: 'Modo invitado',
      message: 'Los datos se guardan solo en esta sesión (se pierden al recargar).',
      tone: 'warning',
    }
  }, [token, email])

  const toneClasses =
    tone === 'success'
      ? 'dark:bg-green-800/30 dark:text-green-700 dark:border-green-700'
      : 'dark:bg-amber-800/30 dark:text-amber-700 dark:border-amber-700'

  return (
    <div
      className={`flex flex-col gap-1 rounded-md border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between ${toneClasses}`}
    >
      <div className="font-semibold">{title}</div>
      <div className="text-[color:inherit] sm:text-right">{message}</div>
    </div>
  )
}
