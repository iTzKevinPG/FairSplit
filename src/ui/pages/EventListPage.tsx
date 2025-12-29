import { Receipt, Users, Wallet } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../../shared/components/ui/badge'
import { EventSelector } from '../components/EventSelector'
import { useEvents } from '../hooks/useEvents'
import { ThemeToggle } from '../components/ThemeToggle'
import { Footer } from '../components/Footer'
import { AuthCard } from '../components/AuthCard'
import { ModeBanner } from '../components/ModeBanner'

function EventListPage() {
  const {
    events,
    selectedEventId,
    loadEvents,
    selectEvent,
    createAndSelect,
    loadEventDetailsForList,
  } = useEvents()
  const navigate = useNavigate()

  useEffect(() => {
    void loadEvents()
  }, [loadEvents])

  useEffect(() => {
    if (events.length === 0) return
    void loadEventDetailsForList(events.map((event) => event.id))
  }, [events, loadEventDetailsForList])

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

  return (
    <div className="min-h-screen bg-[color:var(--color-app-bg)]">
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
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-1 flex-col gap-6 px-6 py-10">
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-primary-main)]">
            FairSplit
          </p>
          <h1 className="text-3xl font-semibold text-[color:var(--color-text-main)] sm:text-4xl">
            Divide y cierra cuentas sin friccion.
          </h1>
          <p className="max-w-3xl text-base text-[color:var(--color-text-muted)]">
            Organiza tus planes, registra gastos y obten balances claros para saber
            quien paga a quien. Usa modo local o tu perfil en la nube.
          </p>
        </section>

        <ModeBanner />

        <AuthCard />

        <EventSelector
          events={events}
          selectedEventId={selectedEventId}
          onSelect={handleSelect}
          onCreate={handleCreate}
          showSelector={false}
        />

        <section className="space-y-4">
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
              {events.map((event) => (
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
                      {event.people.length} integrantes
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5" />
                      {event.invoices.length} gastos
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default EventListPage
