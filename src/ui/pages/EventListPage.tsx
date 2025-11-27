import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { EventSelector } from '../components/EventSelector'
import { useEvents } from '../hooks/useEvents'

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
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">
            FairSplit
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Divide gastos entre amigos con claridad.
          </h1>
          <p className="max-w-3xl text-base text-slate-600">
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
          <h2 className="text-lg font-semibold text-slate-900">
            Eventos recientes
          </h2>
          {events.length === 0 ? (
            <p className="text-sm text-slate-600" data-testid="empty-events">
              Aun no hay eventos. Crea uno para empezar.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {events.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => handleSelect(event.id)}
                  className="flex flex-col items-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow"
                >
                  <span className="text-sm font-semibold text-slate-900">
                    {event.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    Moneda: {event.currency} · Participantes: {event.people.length}
                  </span>
                  <span className="text-xs text-slate-500">
                    Facturas: {event.invoices.length}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default EventListPage
