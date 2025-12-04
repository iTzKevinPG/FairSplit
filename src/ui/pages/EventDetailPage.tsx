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
import { ThemeToggle } from '../components/ThemeToggle'
import { Footer } from '../components/Footer'
import NotFoundPage from './NotFoundPage'

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

  useEffect(() => {
    if (eventId && events.length > 0 && !getSelectedEvent()) {
      navigate('/', { replace: true })
    }
  }, [eventId, events.length, getSelectedEvent, navigate])

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
    return <NotFoundPage />
  }

  if (!selectedEvent) {
    return <NotFoundPage />
  }

  return (
    <main className="min-h-screen bg-[color:var(--color-app-bg)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-600">
              Evento
            </p>
            <h1 className="text-3xl font-semibold text-[color:var(--color-text-main)] sm:text-4xl">
              {selectedEvent.name}
            </h1>
            <p className="text-sm text-[color:var(--color-text-muted)]">
              Moneda: {selectedEvent.currency} · Participantes:{' '}
              {selectedEvent.people.length} · Facturas:{' '}
              {selectedEvent.invoices.length}
            </p>
          </div>
          <Link
            to="/"
            className="ds-btn ds-btn-secondary !py-2 !px-3 text-xs"
          >
            Volver a eventos
          </Link>
          <ThemeToggle />
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
              className={`ds-btn ${
                activeTab === tab.id ? 'ds-btn-primary' : 'ds-btn-secondary'
              } !text-sm !py-2 !px-4`}
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

        <Footer />
      </div>
    </main>
  )
}

export default EventDetailPage
