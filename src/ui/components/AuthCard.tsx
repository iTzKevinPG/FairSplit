import { useMemo, useState } from 'react'
import { useAuthStore } from '../../shared/state/authStore'
import { SectionCard } from './SectionCard'

export function AuthCard() {
  const [code, setCode] = useState('')
  const [expanded, setExpanded] = useState(false)
  const {
    email,
    setEmail,
    status,
    error,
    requestCode,
    verifyCode,
    isCooldownActive,
    isAuthenticated,
  } = useAuthStore()

  const cooldownMs = isCooldownActive()
  const cooldownSeconds = Math.ceil(cooldownMs / 1000)
  const disabledSend = status === 'sending' || cooldownMs > 0
  const disabledVerify = status === 'verifying'

  const statusLabel = useMemo(() => {
    if (status === 'sending') return 'Enviando codigo...'
    if (status === 'verifying') return 'Verificando...'
    if (isAuthenticated()) return 'Perfil activado'
    return 'Entra o crea tu perfil'
  }, [status, isAuthenticated])

  const authenticated = isAuthenticated()

  const handleSend = async () => {
    await requestCode()
  }

  const handleVerify = async () => {
    const ok = await verifyCode(code)
    if (ok) {
      setCode('')
      setExpanded(false)
    }
  }

  const canToggle = !authenticated
  const showContent = expanded && !authenticated

  return (
    <SectionCard
      title="Tu perfil"
      description="Recibe un codigo por email para guardar tus datos en backend (opcional)."
      actions={
        canToggle ? (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="text-sm font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 transition hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
          >
            {expanded ? 'Ocultar' : 'Configurar'}
          </button>
        ) : null
      }
    >
      {authenticated ? (
        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-[color:var(--color-surface)] px-3 py-2 text-sm text-[color:var(--color-text-main)] dark:border-slate-700 dark:bg-[color:var(--color-app-bg)]">
          <span>Sesión activa con {email}</span>
          <span className="ds-badge-soft dark:bg-green-800/30 dark:text-green-700">
            Sesión activa
          </span>
        </div>
      ) : null}

      {showContent ? (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-[color:var(--color-text-muted)]">
            Correo electrónico
            <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="w-full rounded-md border border-slate-200 bg-[color:var(--color-surface)] px-3 py-2 text-[color:var(--color-text-main)] shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-slate-700 dark:bg-[color:var(--color-app-bg)]"
          />
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <button
            type="button"
            onClick={handleSend}
            disabled={disabledSend}
            className="ds-btn ds-btn-primary"
          >
            {disabledSend && cooldownSeconds > 0
              ? `Reenviar en ${cooldownSeconds}s`
              : 'Enviar codigo'}
          </button>
          <p className="text-xs text-[color:var(--color-text-muted)]">{statusLabel}</p>
        </div>
        <label className="flex flex-col gap-1 text-sm text-[color:var(--color-text-muted)]">
          Codigo de 6 dígitos
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            maxLength={6}
            className="w-full rounded-md border border-slate-200 bg-[color:var(--color-surface)] px-3 py-2 text-[color:var(--color-text-main)] shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-slate-700 dark:bg-[color:var(--color-app-bg)]"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleVerify}
            disabled={disabledVerify}
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-[color:var(--color-text-main)] shadow-sm transition hover:border-primary-400 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {disabledVerify ? 'Verificando...' : 'Verificar y entrar'}
          </button>
          {isAuthenticated() ? (
            <span className="ds-badge-soft dark:bg-green-800/30 dark:text-green-700">
              Sesión activa
            </span>
          ) : null}
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      ) : null}
    </SectionCard>
  )
}
