import { useEffect } from 'react'
import { EventSelector } from './ui/components/EventSelector'
import { PeopleSection } from './ui/components/PeopleSection'
import { InvoiceSection } from './ui/components/InvoiceSection'
import { SummarySection } from './ui/components/SummarySection'
import { TransfersSection } from './ui/components/TransfersSection'
import { useFairSplitStore } from './shared/state/fairsplitStore'

function App() {
  const {
    events,
    selectedEventId,
    selectEvent,
    createEvent,
    addPerson,
    removePerson,
    addInvoice,
    removeInvoice,
    getSelectedEvent,
    getBalances,
    getTransfers,
    hydrate,
  } = useFairSplitStore()

  const selectedEvent = getSelectedEvent()
  const balances = selectedEvent ? getBalances() : []
  const transfers = selectedEvent ? getTransfers() : []

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">
            FairSplit
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Divide gastos entre amigos con claridad.
          </h1>
          <p className="max-w-3xl text-base text-slate-600">
            Registra eventos, personas y facturas. Calcula saldos netos y
            transferencias sugeridas para cerrar cuentas rapido. Todo vive en
            memoria por ahora, listo para conectar un backend luego.
          </p>
        </header>

        <div className="space-y-6">
          <EventSelector
            events={events}
            selectedEventId={selectedEventId}
            onSelect={selectEvent}
            onCreate={async (name, currency) => {
              await createEvent({ name, currency })
            }}
          />

          {selectedEvent ? (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-1">
                <PeopleSection
                  people={selectedEvent.people}
                  onAdd={async (name) => {
                    await addPerson({ name })
                  }}
                  onRemove={async (personId) => {
                    await removePerson({ personId })
                  }}
                />
              </div>

              <div className="space-y-6 lg:col-span-2">
                <InvoiceSection
                  invoices={selectedEvent.invoices}
                  people={selectedEvent.people}
                  currency={selectedEvent.currency}
                  onAdd={async (invoice) => {
                    await addInvoice(invoice)
                  }}
                  onRemove={async (invoiceId) => {
                    await removeInvoice({ invoiceId })
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm">
              Crea un evento para empezar a cargar personas y facturas.
            </div>
          )}

          {selectedEvent ? (
            <div className="grid gap-6 md:grid-cols-2">
              <SummarySection
                balances={balances}
                people={selectedEvent.people}
                currency={selectedEvent.currency}
              />
              <TransfersSection
                transfers={transfers}
                people={selectedEvent.people}
                currency={selectedEvent.currency}
              />
            </div>
          ) : null}
        </div>

        <footer className="text-sm text-slate-500">
          Arquitectura limpia: dominio y casos de uso desacoplados de la UI,
          repositorio en memoria y store global con Zustand.
        </footer>
      </div>
    </main>
  )
}

export default App
