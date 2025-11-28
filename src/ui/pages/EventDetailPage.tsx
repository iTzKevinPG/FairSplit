import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useFairSplitStore } from '../../shared/state/fairsplitStore'
import { useEvents } from '../hooks/useEvents'
import { PeopleSection } from '../components/PeopleSection'
import { InvoiceSection } from '../components/InvoiceSection'
import { SummarySection } from '../components/SummarySection'
import { TransfersSection } from '../components/TransfersSection'
import { useState } from 'react'
import { BentoOverview } from '../components/BentoOverview'

function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { events, loadEvents, selectEvent } = useEvents()
  const {
    addPerson,
    removePerson,
    addInvoice,
    removeInvoice,
    updatePerson,
    getBalances,
    getTransfers,
    getSelectedEvent,
  } = useFairSplitStore()

  const [activeTab, setActiveTab] = useState<
    'people' | 'invoices' | 'summary' | 'transfers' | 'overview'
  >('people')

  useEffect(() => {
    void loadEvents()
  }, [loadEvents])

  useEffect(() => {
    if (eventId) {
      selectEvent(eventId)
    }
  }, [eventId, selectEvent, events.length])

  const selectedEvent = getSelectedEvent()
  const balances = useMemo(
    () => (selectedEvent ? getBalances() : []),
    [getBalances, selectedEvent],
  )
  const transfers = useMemo(
    () => (selectedEvent ? getTransfers() : []),
    [getTransfers, selectedEvent],
  )
  const tipTotal = useMemo(
    () =>
      selectedEvent?.invoices.reduce(
        (acc, invoice) => acc + (invoice.tipAmount ?? 0),
        0,
      ) ?? 0,
    [selectedEvent],
  )

  if (!eventId) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <p className="text-sm text-slate-600">
            No event selected.{' '}
            <Link to="/" className="text-indigo-600 underline">
              Back to events
            </Link>
          </p>
        </div>
      </main>
    )
  }

  if (!selectedEvent) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">
              Event not found.{' '}
              <button
                type="button"
                className="text-indigo-600 underline"
                onClick={() => navigate('/')}
              >
                Go back
              </button>
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">
              Evento
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              {selectedEvent.name}
            </h1>
            <p className="text-sm text-slate-600">
              Moneda: {selectedEvent.currency} · Participantes:{' '}
              {selectedEvent.people.length} · Facturas:{' '}
              {selectedEvent.invoices.length}
            </p>
          </div>
          <Link
            to="/"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
          >
            Volver a eventos
          </Link>
        </header>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'people', label: 'Participantes' },
            { id: 'invoices', label: 'Facturas' },
            { id: 'summary', label: 'Resumen' },
            { id: 'transfers', label: 'Transferencias' },
            { id: 'overview', label: 'Resumen total' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'people' && (
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
                onEdit={async (personId, name) => {
                  await updatePerson({ personId, name })
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-6">
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
        )}

        {activeTab === 'summary' && (
          <div className="grid gap-6 md:grid-cols-1">
            <SummarySection
              balances={balances}
              people={selectedEvent.people}
              currency={selectedEvent.currency}
              tipTotal={tipTotal}
            />
          </div>
        )}

        {activeTab === 'transfers' && (
          <div className="grid gap-6 md:grid-cols-1">
            <TransfersSection
              transfers={transfers}
              people={selectedEvent.people}
              currency={selectedEvent.currency}
              tipTotal={tipTotal}
            />
          </div>
        )}

        {activeTab === 'overview' && (
          <BentoOverview
            people={selectedEvent.people}
            invoices={selectedEvent.invoices}
            balances={balances}
            transfers={transfers}
            currency={selectedEvent.currency}
          />
        )}
      </div>
    </main>
  )
}

export default EventDetailPage
