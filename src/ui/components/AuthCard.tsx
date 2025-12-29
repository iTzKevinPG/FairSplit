import { KeyRound, LogOut, Mail } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useAuthStore } from '../../shared/state/authStore'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './Accordion'

export function AuthCard() {
  const [code, setCode] = useState('')
  const [expanded, setExpanded] = useState(false)
  const {
    email,
    setEmail,
    status,
    error,
    fixedCodeMode,
    requestCode,
    verifyCode,
    isCooldownActive,
    isAuthenticated,
    clearAuth,
  } = useAuthStore()

  const cooldownMs = isCooldownActive()
  const cooldownSeconds = Math.ceil(cooldownMs / 1000)
  const disabledSend = status === 'sending' || cooldownMs > 0
  const disabledVerify = status === 'verifying'

  const statusLabel = useMemo(() => {
    if (status === 'sending') return 'Enviando codigo...'
    if (status === 'verifying') return 'Verificando...'
    if (isAuthenticated()) return 'Perfil activado'
    if (fixedCodeMode) return 'Usa el codigo fijo compartido'
    return 'Entra o crea tu perfil'
  }, [status, isAuthenticated, fixedCodeMode])

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
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    void handleVerify()
  }

  return (
    <Accordion
      type="single"
      collapsible
      value={expanded ? 'profile' : ''}
      onValueChange={(value) => setExpanded(value === 'profile')}
      className="card-interactive overflow-hidden rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] shadow-sm transition-colors"
    >
      <AccordionItem value="profile" className="border-b-0">
        <AccordionTrigger className="px-4 py-4 text-left hover:no-underline">
          <div className="flex w-full items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-[color:var(--color-text-main)]">Tu perfil</h3>
              <p className="text-sm text-[color:var(--color-text-muted)]">
                {authenticated
                  ? `Sesion activa con ${email ?? ''}`
                  : 'Ingresa tu correo y codigo para guardar tus datos.'}
              </p>
            </div>
            {authenticated ? (
              <Badge variant="active" className="mr-2">
                Sesion activa
              </Badge>
            ) : null}
          </div>
        </AccordionTrigger>
        <AccordionContent className="border-t border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] px-4 pt-4">
          {authenticated ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-primary-soft)]">
                  <Mail className="h-5 w-5 text-[color:var(--color-primary-main)]" />
                </div>
                <div>
                  <p className="font-medium text-[color:var(--color-text-main)]">{email}</p>
                  <p className="text-sm text-[color:var(--color-text-muted)]">Conectado</p>
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={clearAuth}>
                <LogOut className="h-4 w-4" />
                Cerrar sesion
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {fixedCodeMode ? (
                <div className="rounded-lg border border-[color:var(--color-accent-warning)] bg-[color:var(--color-warning-bg)] px-3 py-3 text-sm text-white">
                  <p className="font-semibold">Modo codigo fijo</p>
                  <p className="text-white/90">
                    Usa el codigo compartido para acceder a tu cuenta.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSend}
                    disabled={disabledSend}
                  >
                    {disabledSend && cooldownSeconds > 0
                      ? `Reenviar en ${cooldownSeconds}s`
                      : 'Enviar codigo'}
                  </Button>
                  <p className="text-xs text-[color:var(--color-text-muted)]">{statusLabel}</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-text-muted)]" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-text-muted)]" />
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={fixedCodeMode ? 'codigo' : '123456'}
                    maxLength={6}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={disabledVerify}
                className="w-full"
              >
                {disabledVerify ? 'Verificando...' : 'Verificar y entrar'}
              </Button>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </form>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
