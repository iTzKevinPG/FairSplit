import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { EventSelector } from '../components/EventSelector'
import { useEvents } from '../hooks/useEvents'
import { ThemeToggle } from '../components/ThemeToggle'
import { Footer } from '../components/Footer'

function EventListPage() {
  const { events, selectedEventId, loadEvents, selectEvent, createAndSelect } =
    useEvents()
  const navigate = useNavigate()

  useEffect(() => {
    void loadEvents()
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

  return (
    <main className="min-h-screen bg-[color:var(--color-app-bg)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-600">
                FairSplit
              </p>
              <h1 className="text-3xl font-semibold text-[color:var(--color-text-main)] sm:text-4xl">
                Divide gastos entre amigos con claridad.
              </h1>
            </div>
            <ThemeToggle />
          </div>
          <p className="max-w-3xl text-base text-[color:var(--color-text-muted)]">
            Crea eventos, agrega participantes y registra facturas. Calcula
            saldos netos y transferencias sugeridas con datos en memoria, listos
            para conectar un backend despues.
          </p>
        </header>

        <EventSelector
          events={events}
          selectedEventId={selectedEventId}
          onSelect={handleSelect}
          onCreate={handleCreate}
          showSelector={false}
        />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[color:var(--color-text-main)]">
            Eventos recientes
          </h2>
          {events.length === 0 ? (
            <p className="text-sm text-[color:var(--color-text-muted)]" data-testid="empty-events">
              Aun no hay eventos. Crea uno para empezar.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {events.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => handleSelect(event.id)}
                  className="ds-card flex flex-col items-start text-left transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="text-sm font-semibold text-[color:var(--color-text-main)]">
                    {event.name}
                  </span>
                  <span className="text-xs text-[color:var(--color-text-muted)]">
                    Moneda: {event.currency} · Participantes: {event.people.length}
                  </span>
                  <span className="text-xs text-[color:var(--color-text-muted)]">
                    Facturas: {event.invoices.length}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <Footer />
      </div>
    </main>
  )
}

export default EventListPage
