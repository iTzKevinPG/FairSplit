import {
  ArrowLeft,
  ArrowRightLeft,
  BarChart3,
  LayoutGrid,
  Receipt,
  Users,
  Wallet,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../../shared/components/ui/badge'
import { buttonVariants } from '../../shared/components/ui/button'
import { useFairSplitStore } from '../../shared/state/fairsplitStore'
import { useEvents } from '../hooks/useEvents'
import { BentoOverview } from '../components/BentoOverview'
import { Footer } from '../components/Footer'
import { InvoiceSection } from '../components/InvoiceSection'
import { ModeBanner } from '../components/ModeBanner'
import { PeopleSection } from '../components/PeopleSection'
import { SummarySection } from '../components/SummarySection'
import { TabNav } from '../components/TabNav'
import { ThemeToggle } from '../components/ThemeToggle'
import { TransfersSection } from '../components/TransfersSection'
import { QuickGuideButton } from '../components/QuickGuideButton'
import NotFoundPage from './NotFoundPage'

const tabs = [
  { id: 'people', label: 'Integrantes', icon: <Users className="h-4 w-4" /> },
  { id: 'invoices', label: 'Gastos', icon: <Receipt className="h-4 w-4" /> },
  { id: 'summary', label: 'Resumen', icon: <BarChart3 className="h-4 w-4" /> },
  {
    id: 'transfers',
    label: 'Transferencias',
    icon: <ArrowRightLeft className="h-4 w-4" />,
  },
  { id: 'overview', label: 'Vista general', icon: <LayoutGrid className="h-4 w-4" /> },
]

function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { events, loadEvents, selectEvent } = useEvents()
  const {
    addPerson,
    removePerson,
    addInvoice,
    removeInvoice,
    updateInvoice,
    updatePerson,
    getBalances,
    getTransfers,
    getSelectedEvent,
    transferStatusesByEvent,
    setTransferStatus,
  } = useFairSplitStore()

  const [activeTab, setActiveTab] = useState<
    'people' | 'invoices' | 'summary' | 'transfers' | 'overview'
  >('people')

  useEffect(() => {
    void loadEvents()
  }, [loadEvents])

  useEffect(() => {
    const handler = (event: Event) => {
      if (!(event instanceof CustomEvent)) return
      const tabId = event.detail?.tabId as
        | 'people'
        | 'invoices'
        | 'summary'
        | 'transfers'
        | 'overview'
        | undefined
      if (!tabId) return
      setActiveTab(tabId)
    }
    window.addEventListener('tour:go-tab', handler)
    return () => {
      window.removeEventListener('tour:go-tab', handler)
    }
  }, [])

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('tour:active-tab', { detail: { tabId: activeTab } }),
    )
  }, [activeTab])

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
  const transferStatusMap = useMemo(() => {
    if (!selectedEvent) return {}
    return transferStatusesByEvent[selectedEvent.id] ?? {}
  }, [selectedEvent, transferStatusesByEvent])
  const tipTotal = useMemo(
    () =>
      selectedEvent?.invoices.reduce(
        (acc, invoice) => acc + (invoice.tipAmount ?? 0),
        0,
      ) ?? 0,
    [selectedEvent],
  )
  const settledByPersonId = useMemo(() => {
    if (!selectedEvent) return {}
    const totals = new Map<string, { total: number; settled: number }>()
    transfers.forEach((transfer) => {
      const key = `${transfer.fromPersonId}::${transfer.toPersonId}`
      const isSettled = Boolean(transferStatusMap[key]?.isSettled)
      const entry = totals.get(transfer.fromPersonId) ?? { total: 0, settled: 0 }
      entry.total += 1
      if (isSettled) entry.settled += 1
      totals.set(transfer.fromPersonId, entry)
    })
    const result: Record<string, boolean> = {}
    totals.forEach((value, personId) => {
      result[personId] = value.total > 0 && value.settled === value.total
    })
    return result
  }, [selectedEvent, transfers, transferStatusMap])

  if (!eventId || !selectedEvent) {
    return <NotFoundPage />
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
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver a eventos</span>
            </Link>
            <QuickGuideButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main
        className="mx-auto flex max-w-5xl flex-1 flex-col gap-6 px-6 py-10"
        data-tour-active-tab={activeTab}
      >
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-primary-main)]">
            Evento
          </p>
          <h1 className="text-3xl font-semibold text-[color:var(--color-text-main)] sm:text-4xl">
            {selectedEvent.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--color-text-muted)]">
            <span className="inline-flex items-center gap-1">
              Moneda:
              <Badge variant="outline">{selectedEvent.currency}</Badge>
            </span>
            <span>Integrantes: {selectedEvent.people.length}</span>
            <span>Gastos: {selectedEvent.invoices.length}</span>
          </div>
        </section>

        <ModeBanner />

        <div data-tour="tab-nav">
          <TabNav
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
          />
        </div>

        {activeTab === 'people' && (
          <div data-tour="people-section">
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
        )}

        {activeTab === 'invoices' && (
          <div data-tour="invoice-section">
            <InvoiceSection
              invoices={selectedEvent.invoices}
              people={selectedEvent.people}
              currency={selectedEvent.currency}
              onAdd={async (invoice) => {
                await addInvoice(invoice)
              }}
              onUpdate={async (invoice) => {
                await updateInvoice(invoice)
              }}
              onRemove={async (invoiceId) => {
                await removeInvoice({ invoiceId })
              }}
            />
          </div>
        )}

        {activeTab === 'summary' && (
          <div data-tour="summary-section">
            <SummarySection
              balances={balances}
              people={selectedEvent.people}
              currency={selectedEvent.currency}
              tipTotal={tipTotal}
            />
          </div>
        )}

        {activeTab === 'transfers' && (
          <div data-tour="transfers-section">
            <TransfersSection
              transfers={transfers}
              people={selectedEvent.people}
              currency={selectedEvent.currency}
              tipTotal={tipTotal}
              transferStatusMap={transferStatusMap}
              onToggleStatus={(transfer, isSettled) => {
                void setTransferStatus({
                  eventId: selectedEvent.id,
                  fromPersonId: transfer.fromPersonId,
                  toPersonId: transfer.toPersonId,
                  isSettled,
                })
              }}
            />
          </div>
        )}

        {activeTab === 'overview' && (
          <div data-tour="overview-section">
            <BentoOverview
              people={selectedEvent.people}
              invoices={selectedEvent.invoices}
              balances={balances}
              transfers={transfers}
              currency={selectedEvent.currency}
              transferStatusMap={transferStatusMap}
              settledByPersonId={settledByPersonId}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default EventDetailPage
