import {
  CalendarPlus,
  Receipt,
  UserPlus,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../../shared/components/ui/badge'
import { Button } from '../../shared/components/ui/button'
import { EventSelector } from '../components/EventSelector'
import { useEvents } from '../hooks/useEvents'
import { Footer } from '../components/Footer'
import { QuickGuideButton } from '../components/QuickGuideButton'
import { ProfileModal } from '../components/ProfileModal'
import {
  SessionMenu,
  SessionMenuButton,
  SessionStatusPill,
} from '../components/SessionMenu'

function EventListPage() {
  const {
    events,
    selectedEventId,
    loadEvents,
    selectEvent,
    createAndSelect,
    isEventLoaded,
  } = useEvents()
  const navigate = useNavigate()
  const [showIntro, setShowIntro] = useState(() => {
    const seen = window.localStorage.getItem('fairsplit-intro-seen')
    return !seen
  })
  const [showProfile, setShowProfile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const hasLoadedRef = useRef(false)
  const hasAuthToken =
    typeof window !== 'undefined' &&
    Boolean(window.localStorage.getItem('fairsplit_auth_token'))

  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true
    void loadEvents({ loadDetails: false })
  }, [loadEvents])


  const handleSelect = (eventId: string) => {
    selectEvent(eventId)
    navigate(`/events/${eventId}`)
  }

  const handleCreate = async (name: string, currency: string) => {
    const event = await createAndSelect({ name, currency })
    if (event) {
      navigate(`/events/${event.id}`)
    }
  }

  const handleCloseIntro = () => {
    window.localStorage.setItem('fairsplit-intro-seen', 'true')
    setShowIntro(false)
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-app-bg)]">
      <SessionMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenProfile={() => setShowProfile(true)}
      />

      {showIntro ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
          <div
            className="relative w-full max-w-2xl rounded-2xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-6 shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-label="Bienvenida a FairSplit"
          >
            <button
              type="button"
              onClick={handleCloseIntro}
              className="absolute right-4 top-4 rounded-full border border-transparent p-1 text-[color:var(--color-text-muted)] hover:border-[color:var(--color-border-subtle)] hover:text-[color:var(--color-text-main)]"
              aria-label="Cerrar bienvenida"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-primary-main)]">
                  FairSplit
                </p>
                <h1 className="text-2xl font-semibold text-[color:var(--color-text-main)] sm:text-3xl">
                  Divide y cierra cuentas sin friccion.
                </h1>
                <p className="text-sm text-[color:var(--color-text-muted)]">
                  Organiza tus planes, registra gastos y obten balances claros para saber
                  quien paga a quien. Usa modo local o tu perfil en la nube.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--color-text-main)]">
                    <CalendarPlus className="h-4 w-4 text-[color:var(--color-primary-main)]" />
                    Crea el evento
                  </div>
                  <p className="mt-2 text-xs text-[color:var(--color-text-muted)]">
                    Define nombre y moneda en segundos.
                  </p>
                </div>
                <div className="rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--color-text-main)]">
                    <UserPlus className="h-4 w-4 text-[color:var(--color-primary-main)]" />
                    Invita al grupo
                  </div>
                  <p className="mt-2 text-xs text-[color:var(--color-text-muted)]">
                    Agrega personas y define el pagador.
                  </p>
                </div>
                <div className="rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--color-text-main)]">
                    <Receipt className="h-4 w-4 text-[color:var(--color-primary-main)]" />
                    Registra gastos
                  </div>
                  <p className="mt-2 text-xs text-[color:var(--color-text-muted)]">
                    Ve saldos y transferencias claras.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-[color:var(--color-text-muted)]">
                <span className="accent-chip">En minutos</span>
                <span className="accent-chip">Modo local o nube</span>
                <span className="accent-chip">Transferencias simples</span>
              </div>

              <div className="flex justify-end">
                <Button type="button" size="sm" onClick={handleCloseIntro}>
                  Empezar
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />

      <header className="sticky top-0 z-40 border-b border-[color:var(--color-border-subtle)] bg-[color:var(--color-app-bg)]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color:var(--color-primary-main)] text-[color:var(--color-text-on-primary)]">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold text-[color:var(--color-text-main)]">
              FairSplit
            </span>
          </div>
          <div className="flex items-center gap-2">
            <QuickGuideButton />
            <SessionStatusPill />
            <SessionMenuButton onClick={() => setMenuOpen((prev) => !prev)} />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-primary-main)]">
                FairSplit
              </p>
              <h1 className="text-3xl font-semibold text-[color:var(--color-text-main)] sm:text-4xl">
                Empieza tu evento en minutos.
              </h1>
              <p className="max-w-2xl text-base text-[color:var(--color-text-muted)]">
                Configura un evento, agrega tu grupo y registra gastos sin friccion.
                Todo queda listo para ver saldos y transferencias.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-4 shadow-sm">
                <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
                  1. Crea el evento
                </p>
                <p className="mt-2 text-xs text-[color:var(--color-text-muted)]">
                  Nombre + moneda para empezar.
                </p>
              </div>
              <div className="rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-4 shadow-sm">
                <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
                  2. Agrega integrantes
                </p>
                <p className="mt-2 text-xs text-[color:var(--color-text-muted)]">
                  Lista de amigos y primer gasto.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4" id="event-create">
            <div className="ds-card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-[color:var(--color-text-main)]">
                    Empieza aqui
                  </h2>
                  <p className="text-sm text-[color:var(--color-text-muted)]">
                    Crea tu primer evento y luego agrega a tu grupo.
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] font-semibold">
                  Paso 1
                </Badge>
              </div>

              <div className="mt-4 space-y-4">
                <div data-tour="event-create">
                  <EventSelector
                    events={events}
                    selectedEventId={selectedEventId}
                    onSelect={handleSelect}
                    onCreate={handleCreate}
                    showSelector={false}
                  />
                </div>

                <p className="text-xs text-[color:var(--color-text-muted)]">
                  Gestiona tu perfil desde el menu para activar la nube.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4" data-tour="events-list">
          <h2 className="text-lg font-semibold text-[color:var(--color-text-main)]">
            Tus eventos recientes
          </h2>
          {events.length === 0 ? (
            <div
              className="rounded-lg border border-dashed border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-6 text-center"
              data-testid="empty-events"
            >
              <p className="text-sm text-[color:var(--color-text-muted)]">
                Aun no tienes eventos. Crea el primero para empezar.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {events.map((event) => {
                const loaded = isEventLoaded(event.id)
                const peopleCount =
                  typeof event.peopleCount === 'number'
                    ? event.peopleCount
                    : event.people.length
                const invoiceCount =
                  typeof event.invoiceCount === 'number'
                    ? event.invoiceCount
                    : event.invoices.length
                return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => handleSelect(event.id)}
                  className="ds-card card-interactive flex flex-col items-start text-left"
                >
                  <span className="text-sm font-semibold text-[color:var(--color-text-main)]">
                    {event.name}
                  </span>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[color:var(--color-text-muted)]">
                    <Badge variant="outline" className="text-[10px] font-semibold">
                      {event.currency}
                    </Badge>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {loaded || typeof event.peopleCount === 'number' || !hasAuthToken
                        ? `${peopleCount} integrantes`
                        : 'Integrantes: —'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5" />
                      {loaded || typeof event.invoiceCount === 'number' || !hasAuthToken
                        ? `${invoiceCount} gastos`
                        : 'Gastos: —'}
                    </span>
                  </div>
                </button>
                )
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default EventListPage
