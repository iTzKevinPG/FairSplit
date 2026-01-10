import {
  ArrowLeft,
  ArrowRightLeft,
  BarChart3,
  LayoutGrid,
  Receipt,
  Users,
  Wallet,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { buttonVariants } from '../../shared/components/ui/button'
import { useFairSplitStore } from '../../shared/state/fairsplitStore'
import { useEvents } from '../hooks/useEvents'
import { BentoOverview } from '../components/BentoOverview'
import { Footer } from '../components/Footer'
import { InvoiceSection } from '../components/InvoiceSection'
import { PeopleSection } from '../components/PeopleSection'
import { SummarySection } from '../components/SummarySection'
import { TabNav } from '../components/TabNav'
import { TransfersSection } from '../components/TransfersSection'
import { QuickGuideButton } from '../components/QuickGuideButton'
import { ProfileModal } from '../components/ProfileModal'
import {
  SessionMenu,
  SessionMenuButton,
  SessionStatusPill,
} from '../components/SessionMenu'
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
  const {
    events,
    selectedEventId,
    selectEvent,
    loadEventDetailsForList,
    loadEvents,
  } = useEvents()
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
  const [showProfile, setShowProfile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    if (hasLoadedRef.current || events.length > 0) return
    hasLoadedRef.current = true
    void loadEvents({ loadDetails: false })
  }, [events.length, loadEvents])

  useEffect(() => {
    if (!eventId) return
    void loadEventDetailsForList([eventId])
  }, [eventId, loadEventDetailsForList])

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
    const timeoutId = window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('tour:tab-rendered', { detail: { tabId: activeTab } }),
      )
    }, 120)
    return () => window.clearTimeout(timeoutId)
  }, [activeTab])

  useEffect(() => {
    if (!eventId) return
    if (selectedEventId === eventId) return
    if (!events.some((event) => event.id === eventId)) return
    void selectEvent(eventId)
  }, [eventId, events, selectedEventId, selectEvent])

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
    const netByPersonId = new Map<string, number>()
    balances.forEach((balance) => {
      netByPersonId.set(balance.personId, balance.net)
    })

    const totals = new Map<string, { total: number; settled: number }>()
    transfers.forEach((transfer) => {
      const key = `${transfer.fromPersonId}::${transfer.toPersonId}`
      const isSettled = Boolean(transferStatusMap[key]?.isSettled)
      const fromEntry = totals.get(transfer.fromPersonId) ?? { total: 0, settled: 0 }
      fromEntry.total += 1
      if (isSettled) fromEntry.settled += 1
      totals.set(transfer.fromPersonId, fromEntry)

      const toEntry = totals.get(transfer.toPersonId) ?? { total: 0, settled: 0 }
      toEntry.total += 1
      if (isSettled) toEntry.settled += 1
      totals.set(transfer.toPersonId, toEntry)
    })

    const result: Record<string, boolean> = {}
    selectedEvent.people.forEach((person) => {
      const net = netByPersonId.get(person.id) ?? 0
      if (Math.abs(net) < 0.01) {
        result[person.id] = true
        return
      }
      const entry = totals.get(person.id)
      if (!entry || entry.total === 0) {
        result[person.id] = false
        return
      }
      result[person.id] = entry.settled === entry.total
    })
    return result
  }, [balances, selectedEvent, transfers, transferStatusMap])

  if (!eventId || !selectedEvent) {
    return <NotFoundPage />
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-app-bg)]">
      <SessionMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenProfile={() => setShowProfile(true)}
        backLink={{ href: '/', label: 'Volver a eventos' }}
      />

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
            <Link
              to="/"
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver a eventos</span>
            </Link>
            <QuickGuideButton />
            <SessionStatusPill />
            <SessionMenuButton onClick={() => setMenuOpen((prev) => !prev)} />
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
          <div className="flex flex-wrap gap-2 text-xs text-[color:var(--color-text-muted)]">
            <span className="rounded-full border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] px-3 py-1">
              Moneda: <span className="font-semibold text-[color:var(--color-text-main)]">{selectedEvent.currency}</span>
            </span>
            <span className="rounded-full border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] px-3 py-1">
              Integrantes: <span className="font-semibold text-[color:var(--color-text-main)]">{selectedEvent.people.length}</span>
            </span>
            <span className="rounded-full border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] px-3 py-1">
              Gastos: <span className="font-semibold text-[color:var(--color-text-main)]">{selectedEvent.invoices.length}</span>
            </span>
          </div>
        </section>

        <div data-tour="tab-nav">
          <TabNav
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => {
              setActiveTab(tabId as typeof activeTab)
            }}
          />
        </div>

        <div
          data-tour="people-section"
          className={activeTab === 'people' ? 'block' : 'hidden'}
          aria-hidden={activeTab !== 'people'}
        >
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

        <div
          data-tour="invoice-section"
          className={activeTab === 'invoices' ? 'block' : 'hidden'}
          aria-hidden={activeTab !== 'invoices'}
        >
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

        <div
          data-tour="summary-section"
          className={activeTab === 'summary' ? 'block' : 'hidden'}
          aria-hidden={activeTab !== 'summary'}
        >
          <SummarySection
            balances={balances}
            people={selectedEvent.people}
            currency={selectedEvent.currency}
            tipTotal={tipTotal}
          />
        </div>

        <div
          data-tour="transfers-section"
          className={activeTab === 'transfers' ? 'block' : 'hidden'}
          aria-hidden={activeTab !== 'transfers'}
        >
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

        <div
          data-tour="overview-section"
          className={activeTab === 'overview' ? 'block' : 'hidden'}
          aria-hidden={activeTab !== 'overview'}
        >
          <BentoOverview
            eventId={selectedEvent.id}
            people={selectedEvent.people}
            invoices={selectedEvent.invoices}
            balances={balances}
            transfers={transfers}
            currency={selectedEvent.currency}
            transferStatusMap={transferStatusMap}
            settledByPersonId={settledByPersonId}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default EventDetailPage
