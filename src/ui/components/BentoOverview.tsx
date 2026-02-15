import { useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Receipt,
  Users,
  Handshake,
} from 'lucide-react'
import type { Balance } from '../../domain/settlement/Balance'
import type { SettlementTransfer } from '../../domain/settlement/SettlementTransfer'
import type { TransferStatus } from '../../domain/settlement/TransferStatus'
import type { InvoiceForUI, PersonForUI } from '../../shared/state/fairsplitStore'
import { Checkbox } from '../../shared/components/ui/checkbox'
import { AmountDisplay } from './AmountDisplay'

interface BentoOverviewProps {
  people: PersonForUI[]
  invoices: InvoiceForUI[]
  balances: Balance[]
  transfers: SettlementTransfer[]
  transferStatusMap: Record<string, TransferStatus>
  settledByPersonId: Record<string, boolean>
  currency: string
}

const emojis = ['😎', '🤙', '🔥', '✨', '🎉', '💪', '🌟', '🚀', '🎯', '💜']

export function BentoOverview({
  people,
  invoices,
  balances,
  transfers,
  transferStatusMap,
  settledByPersonId,
  currency,
}: BentoOverviewProps) {
  const totalAmount = invoices.reduce((acc, inv) => acc + inv.amount, 0)
  const totalTips = invoices.reduce((acc, inv) => acc + (inv.tipAmount ?? 0), 0)
  const grandTotal = roundToCents(totalAmount + totalTips)
  const totalItems = invoices.reduce((acc, inv) => acc + (inv.items?.length ?? 0), 0)
  const totalTransfers = transfers.length
  const settledTransfers = transfers.reduce((acc, transfer) => {
    const key = buildTransferKey(transfer.fromPersonId, transfer.toPersonId)
    return acc + (transferStatusMap[key]?.isSettled ? 1 : 0)
  }, 0)
  const pendingTransfers = totalTransfers - settledTransfers

  const orderedTransfers = [...transfers].sort((a, b) => {
    const aSettled = transferStatusMap[buildTransferKey(a.fromPersonId, a.toPersonId)]?.isSettled
    const bSettled = transferStatusMap[buildTransferKey(b.fromPersonId, b.toPersonId)]?.isSettled
    return Number(Boolean(aSettled)) - Number(Boolean(bSettled))
  })

  return (
    <div className="space-y-4">
      {/* Grand total banner */}
      {invoices.length > 0 && (
        <div className="ds-card-glow rounded-2xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-4 sm:p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
                Total del evento
              </p>
              <p className="text-2xl font-bold text-[color:var(--color-primary-main)] sm:text-3xl">
                {currency} {grandTotal.toFixed(2)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] px-2.5 py-0.5 font-medium text-[color:var(--color-text-muted)]">
                Subtotal: {currency} {roundToCents(totalAmount).toFixed(2)}
              </span>
              {totalTips > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-warning-bg)] px-2.5 py-0.5 font-semibold text-[color:var(--color-accent-warning)]">
                  ✨ Propinas: {currency} {roundToCents(totalTips).toFixed(2)}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] px-2.5 py-0.5 font-medium text-[color:var(--color-text-muted)]">
                {invoices.length} gasto{invoices.length !== 1 ? 's' : ''} · {people.length} persona{people.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Stats header */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Personas"
          value={people.length.toString()}
          icon={<Users className="h-4 w-4" />}
          color="primary"
        />
        <StatCard
          label="Gastos"
          value={invoices.length.toString()}
          sub={`Total: ${currency} ${grandTotal.toFixed(2)}`}
          icon={<Receipt className="h-4 w-4" />}
          color="coral"
        />
        <StatCard
          label="Balance"
          value={balances.length.toString()}
          icon={<BarChart3 className="h-4 w-4" />}
          color="lila"
        />
        <StatCard
          label="Pagos"
          value={`${settledTransfers}/${totalTransfers}`}
          sub={pendingTransfers > 0 ? `${pendingTransfers} pendiente${pendingTransfers !== 1 ? 's' : ''}` : 'Todo saldado ✅'}
          icon={<Handshake className="h-4 w-4" />}
          color="success"
        />
      </div>

      {/* Collapsible sections */}
      <CollapsibleSection
        title="El grupo"
        badge={`${people.length}`}
        icon={<Users className="h-4 w-4 text-[color:var(--color-primary-main)]" />}
        defaultOpen
      >
        {people.length === 0 ? (
          <p className="text-xs text-[color:var(--color-text-muted)]">Aún no hay nadie.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {people.map((p, i) => {
              const balance = balances.find((b) => b.personId === p.id)
              const isSettled = settledByPersonId[p.id]
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl bg-[color:var(--color-surface-muted)] px-3 py-2.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary-soft)] text-sm">
                    {emojis[i % emojis.length]}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold text-[color:var(--color-text-main)]">
                      {p.name}
                    </span>
                    {balance ? (
                      <span className="text-[10px] text-[color:var(--color-text-muted)]">
                        {balance.net > 0 ? 'A favor' : balance.net < 0 ? 'Debe' : 'En paz'}
                        {isSettled ? ' ✅' : ''}
                      </span>
                    ) : null}
                  </div>
                  {balance ? (
                    <AmountDisplay amount={balance.net} currency={currency} showSign size="sm" />
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="Gastos"
        badge={`${invoices.length}`}
        icon={<Receipt className="h-4 w-4 text-[color:var(--color-accent-coral)]" />}
        extra={
          <span className="text-[11px] font-semibold text-[color:var(--color-primary-main)]">
            {currency} {grandTotal.toFixed(2)}
          </span>
        }
      >
        {invoices.length === 0 ? (
          <p className="text-xs text-[color:var(--color-text-muted)]">Aún no hay gastos.</p>
        ) : (
          <div className="space-y-2">
            {totalTips > 0 && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-warning-bg)] px-3 py-1 text-[11px] font-semibold text-[color:var(--color-accent-warning)]">
                Propina total: {currency} {roundToCents(totalTips).toFixed(2)}
              </div>
            )}
            {totalItems > 0 && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-info-bg)] px-3 py-1 text-[11px] font-semibold text-[color:var(--color-accent-info)] ml-2">
                {totalItems} items registrados
              </div>
            )}
            {invoices.map((inv) => (
              <InvoiceRow key={inv.id} invoice={inv} people={people} currency={currency} />
            ))}
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="Balance"
        badge={`${balances.length}`}
        icon={<BarChart3 className="h-4 w-4 text-[color:var(--color-accent-lila)]" />}
      >
        {balances.length === 0 ? (
          <p className="text-xs text-[color:var(--color-text-muted)]">Agrega gastos para ver balances.</p>
        ) : (
          <div className="space-y-1.5">
            {balances.map((b) => (
              <div
                key={b.personId}
                className="flex items-center justify-between rounded-xl bg-[color:var(--color-surface-muted)] px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={Boolean(settledByPersonId[b.personId])}
                    disabled
                    aria-label={`Estado: ${resolvePersonName(b.personId, people)}`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
                      {resolvePersonName(b.personId, people)}
                    </p>
                    <p className="text-[10px] text-[color:var(--color-text-muted)]">
                      Pagó {currency} {roundToCents(b.totalPaid).toFixed(2)} · Debe {currency} {roundToCents(b.totalOwed).toFixed(2)}
                    </p>
                  </div>
                </div>
                <AmountDisplay amount={b.net} currency={currency} showSign />
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="Pagos"
        badge={pendingTransfers > 0 ? `${pendingTransfers} pendiente${pendingTransfers !== 1 ? 's' : ''}` : '✅'}
        icon={<Handshake className="h-4 w-4 text-[color:var(--color-accent-success)]" />}
        defaultOpen={pendingTransfers > 0}
      >
        {transfers.length === 0 ? (
          <p className="text-xs text-[color:var(--color-text-muted)]">Nadie debe nada, ¡todo bien!</p>
        ) : (
          <div className="space-y-1.5">
            {orderedTransfers.map((t, idx) => {
              const key = buildTransferKey(t.fromPersonId, t.toPersonId)
              const isSettled = Boolean(transferStatusMap[key]?.isSettled)
              return (
                <div
                  key={`${key}-${idx}`}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
                    isSettled
                      ? 'bg-[color:var(--color-success-bg)]'
                      : 'bg-[color:var(--color-surface-muted)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isSettled}
                      disabled
                      aria-label={`Pago: ${resolvePersonName(t.fromPersonId, people)} a ${resolvePersonName(t.toPersonId, people)}`}
                    />
                    <span className={`text-sm font-medium ${isSettled ? 'line-through text-[color:var(--color-text-muted)]' : 'text-[color:var(--color-text-main)]'}`}>
                      {resolvePersonName(t.fromPersonId, people)}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-[color:var(--color-text-muted)]" />
                    <span className={`text-sm font-semibold ${isSettled ? 'line-through text-[color:var(--color-text-muted)]' : 'text-[color:var(--color-primary-main)]'}`}>
                      {resolvePersonName(t.toPersonId, people)}
                    </span>
                  </div>
                  <AmountDisplay amount={t.amount} currency={currency} showSign={false} size="sm" />
                </div>
              )
            })}
          </div>
        )}
      </CollapsibleSection>
    </div>
  )
}

/* ── Collapsible Section ── */

function CollapsibleSection({
  title,
  badge,
  icon,
  extra,
  defaultOpen = false,
  children,
}: {
  title: string
  badge?: string
  icon: React.ReactNode
  extra?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] transition-shadow hover:shadow-[var(--shadow-sm)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[color:var(--color-surface-muted)]/50"
      >
        {icon}
        <span className="flex-1 text-sm font-semibold text-[color:var(--color-text-main)]">
          {title}
        </span>
        {extra}
        {badge && (
          <span className="rounded-full bg-[color:var(--color-surface-muted)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--color-text-muted)]">
            {badge}
          </span>
        )}
        {open ? (
          <ChevronUp className="h-4 w-4 text-[color:var(--color-text-muted)]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[color:var(--color-text-muted)]" />
        )}
      </button>
      {open && (
        <div className="animate-fade-in border-t border-[color:var(--color-border-subtle)] px-4 py-3">
          {children}
        </div>
      )}
    </div>
  )
}

/* ── Invoice Row (expandable) ── */

function InvoiceRow({
  invoice,
  people,
  currency,
}: {
  invoice: InvoiceForUI
  people: PersonForUI[]
  currency: string
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl bg-[color:var(--color-surface-muted)] transition-colors">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--color-accent-coral-soft)]">
          <Receipt className="h-4 w-4 text-[color:var(--color-accent-coral)]" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold text-[color:var(--color-text-main)]">
            {invoice.description}
          </span>
          <span className="text-[10px] text-[color:var(--color-text-muted)]">
            Pagó {resolvePersonName(invoice.payerId, people)} · {invoice.participantIds.length} persona{invoice.participantIds.length !== 1 ? 's' : ''}
            {invoice.divisionMethod === 'consumption' ? ' · Por consumo' : ' · Partes iguales'}
          </span>
        </div>
        <div className="shrink-0 text-right">
          {invoice.tipAmount ? (
            <p className="text-[9px] text-[color:var(--color-accent-warning)]">
              +{currency} {invoice.tipAmount.toFixed(2)} propina
            </p>
          ) : null}
          <span className="text-sm font-bold text-[color:var(--color-primary-main)]">
            {currency} {roundToCents(invoice.amount + (invoice.tipAmount ?? 0)).toFixed(2)}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-text-muted)]" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-text-muted)]" />
        )}
      </button>

      {expanded && (
        <div className="animate-fade-in space-y-2 border-t border-[color:var(--color-border-subtle)] px-3 py-2.5">
          {/* Tip */}
          {invoice.tipAmount ? (
            <span className="inline-flex items-center rounded-full bg-[color:var(--color-warning-bg)] px-2.5 py-0.5 text-[10px] font-semibold text-[color:var(--color-accent-warning)]">
              Propina: {currency} {invoice.tipAmount.toFixed(2)}
            </span>
          ) : null}

          {/* Birthday */}
          {invoice.birthdayPersonId ? (
            <p className="text-[11px] font-semibold text-[color:var(--color-primary-main)]">
              🎂 Invitado especial: {resolvePersonName(invoice.birthdayPersonId, people)}
            </p>
          ) : null}

          {/* Participants */}
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[color:var(--color-text-muted)]">
              Participantes
            </p>
            <div className="flex flex-wrap gap-1.5">
              {invoice.participantIds.map((id) => (
                <span
                  key={id}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                    id === invoice.payerId
                      ? 'bg-[color:var(--color-primary-main)] text-[color:var(--color-text-on-primary)]'
                      : 'bg-[color:var(--color-surface-card)] border border-[color:var(--color-border-subtle)] text-[color:var(--color-text-main)]'
                  }`}
                >
                  {resolvePersonName(id, people)}
                  {id === invoice.payerId ? ' 💳' : ''}
                </span>
              ))}
            </div>
          </div>

          {/* Items */}
          {invoice.divisionMethod === 'consumption' && invoice.items?.length ? (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[color:var(--color-text-muted)]">
                Items
              </p>
              <div className="space-y-1">
                {invoice.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-[color:var(--color-surface-card)] px-2.5 py-1.5 text-[11px]"
                  >
                    <div>
                      <span className="font-medium text-[color:var(--color-text-main)]">{item.name}</span>
                      <span className="ml-1.5 text-[color:var(--color-text-muted)]">
                        {item.quantity}x {currency} {item.unitPrice.toFixed(2)}
                      </span>
                    </div>
                    <span className="font-semibold text-[color:var(--color-primary-main)]">
                      {currency} {(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

/* ── Stat Card ── */

const colorMap = {
  primary: {
    bg: 'bg-[color:var(--color-primary-soft)]',
    text: 'text-[color:var(--color-primary-main)]',
  },
  coral: {
    bg: 'bg-[color:var(--color-accent-coral-soft)]',
    text: 'text-[color:var(--color-accent-coral)]',
  },
  lila: {
    bg: 'bg-[color:var(--color-accent-lila-soft)]',
    text: 'text-[color:var(--color-accent-lila)]',
  },
  success: {
    bg: 'bg-[color:var(--color-success-bg)]',
    text: 'text-[color:var(--color-accent-success)]',
  },
}

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  color: keyof typeof colorMap
}) {
  const c = colorMap[color]
  return (
    <div className="rounded-2xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-3.5">
      <div className="flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${c.bg} ${c.text}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold text-[color:var(--color-text-main)] leading-tight">{value}</p>
          <p className="truncate text-[10px] font-medium text-[color:var(--color-text-muted)]">{label}</p>
        </div>
      </div>
      {sub && (
        <p className="mt-1.5 truncate text-[10px] text-[color:var(--color-text-muted)]">{sub}</p>
      )}
    </div>
  )
}

/* ── Helpers ── */

function resolvePersonName(id: string, people: PersonForUI[]) {
  return people.find((person) => person.id === id)?.name ?? 'Desconocido'
}

function buildTransferKey(fromPersonId: string, toPersonId: string) {
  return `${fromPersonId}::${toPersonId}`
}

const roundToCents = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100
