import { ChevronDown, ChevronUp, CreditCard, Edit2, Receipt, Sparkles, Trash2, Users } from 'lucide-react'
import { ActionMenu } from '../../../shared/components/ActionMenu'
import { Button } from '../../../shared/components/ui/button'
import type { InvoiceItem } from '../../../domain/invoice/Invoice'
import type { InvoiceForUI, PersonForUI } from '../../../shared/state/fairsplitStore'
import { EmptyStateIllustration } from '../EmptyStateIllustration'

interface InvoiceListProps {
  invoices: InvoiceForUI[]
  currency: string
  people: PersonForUI[]
  detailInvoiceId: string | null
  detailInvoice: InvoiceForUI | null
  participantShares: Array<{
    personId: string
    amount: number
    tipPortion?: number
    isBirthday?: boolean
  }>
  onToggleDetail: (invoiceId: string) => void
  onEdit: (invoice: InvoiceForUI) => void
  onRemove: (invoiceId: string) => void
  resolvePersonName: (id: string, people: PersonForUI[]) => string
  getItemTotal: (item: InvoiceItem) => number
}

export function InvoiceList({
  invoices,
  currency,
  people,
  detailInvoiceId,
  detailInvoice,
  participantShares,
  onToggleDetail,
  onEdit,
  onRemove,
  resolvePersonName,
  getItemTotal,
}: InvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-8 text-center">
        <EmptyStateIllustration variant="invoices" />
        <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
          Sin gastos todavía
        </p>
        <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
          Toca "Agregar gasto" para registrar el primero. 🧾
        </p>
      </div>
    )
  }

  return (
    <div className="relative z-0 space-y-3">
      {invoices.map((invoice, index) => {
        const isExpanded = detailInvoiceId === invoice.id
        const shares = isExpanded && detailInvoice ? participantShares : []
        const tipAmount = isExpanded && detailInvoice ? (detailInvoice.tipAmount ?? 0) : 0
        const grandTotal = invoice.amount + (invoice.tipAmount ?? 0)

        return (
          <div
            key={invoice.id}
            className="animate-stagger-fade-in group rounded-2xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] transition-all duration-200 hover:border-[color:var(--color-primary-light)] hover:shadow-[var(--shadow-md)]"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <div className="p-3 sm:p-4">
              {/* Top row: icon + description + action menu */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color:var(--color-accent-coral-soft)] sm:h-10 sm:w-10">
                  <Receipt className="h-4 w-4 text-[color:var(--color-accent-coral)] sm:h-5 sm:w-5" />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="truncate text-sm font-semibold text-[color:var(--color-text-main)]">
                    {invoice.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-[color:var(--color-text-muted)]">
                    <span>Pagó {resolvePersonName(invoice.payerId, people)} 💳</span>
                    <span className="hidden sm:inline">·</span>
                    <span className="hidden sm:inline">{invoice.participantIds.length} persona{invoice.participantIds.length !== 1 ? 's' : ''}</span>
                    <span className="hidden sm:inline">·</span>
                    <span className="hidden text-[10px] uppercase tracking-wide sm:inline">
                      {invoice.divisionMethod === 'consumption' ? 'Por consumo' : 'Partes iguales'}
                    </span>
                  </div>
                </div>

                <ActionMenu
                  items={[
                    {
                      label: 'Editar',
                      icon: <Edit2 className="h-4 w-4" />,
                      onClick: () => onEdit(invoice),
                    },
                    {
                      label: 'Eliminar',
                      icon: <Trash2 className="h-4 w-4" />,
                      tone: 'danger',
                      onClick: () => onRemove(invoice.id),
                    },
                  ]}
                />
              </div>

              {/* Bottom row: meta badges + amount + expand */}
              <div className="mt-2 flex items-center justify-between gap-2 pl-12 sm:pl-[52px]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-[color:var(--color-surface-muted)] px-2 py-0.5 text-[10px] font-medium text-[color:var(--color-text-muted)]">
                    {invoice.participantIds.length} persona{invoice.participantIds.length !== 1 ? 's' : ''}
                  </span>
                  <span className="rounded-full bg-[color:var(--color-surface-muted)] px-2 py-0.5 text-[10px] font-medium text-[color:var(--color-text-muted)] sm:hidden">
                    {invoice.divisionMethod === 'consumption' ? 'Por consumo' : 'Iguales'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-[color:var(--color-primary-main)]">
                    {currency} {grandTotal.toFixed(2)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-full text-[color:var(--color-text-muted)] hover:text-[color:var(--color-primary-main)]"
                    onClick={() => onToggleDetail(invoice.id)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {isExpanded && detailInvoice ? (
              <div className="animate-fade-in border-t border-[color:var(--color-border-subtle)] ds-card-glow rounded-b-2xl p-4 sm:p-5 space-y-4">

                {/* ── Summary header ── */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-full bg-[color:var(--color-surface-card)] border border-[color:var(--color-border-subtle)] px-3 py-1 text-[11px] font-semibold text-[color:var(--color-text-main)]">
                    <CreditCard className="h-3 w-3 text-[color:var(--color-primary-main)]" />
                    Pagó: {resolvePersonName(detailInvoice.payerId, people)}
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-[color:var(--color-surface-card)] border border-[color:var(--color-border-subtle)] px-3 py-1 text-[11px] font-semibold text-[color:var(--color-text-muted)]">
                    <Users className="h-3 w-3" />
                    {detailInvoice.participantIds.length} participante{detailInvoice.participantIds.length !== 1 ? 's' : ''}
                  </div>
                  {detailInvoice.birthdayPersonId ? (
                    <div className="flex items-center gap-1.5 rounded-full bg-[color:var(--color-primary-main)]/10 border border-[color:var(--color-primary-light)] px-3 py-1 text-[11px] font-semibold text-[color:var(--color-primary-main)]">
                      🎂 {resolvePersonName(detailInvoice.birthdayPersonId, people)}
                    </div>
                  ) : null}
                </div>

                {/* ── Totals card ── */}
                <div className="rounded-xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[color:var(--color-text-muted)]">Subtotal</span>
                    <span className="text-sm font-semibold text-[color:var(--color-text-main)]">
                      {currency} {detailInvoice.amount.toFixed(2)}
                    </span>
                  </div>
                  {tipAmount > 0 ? (
                    <>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-[color:var(--color-accent-warning)]">
                          <Sparkles className="h-3 w-3" /> Propina
                        </span>
                        <span className="text-sm font-semibold text-[color:var(--color-accent-warning)]">
                          {currency} {tipAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-2 border-t border-dashed border-[color:var(--color-border-subtle)] pt-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-[color:var(--color-text-main)]">Total</span>
                        <span className="text-base font-bold text-[color:var(--color-primary-main)]">
                          {currency} {grandTotal.toFixed(2)}
                        </span>
                      </div>
                    </>
                  ) : null}
                </div>

                {/* ── Items (consumption mode) ── */}
                {detailInvoice.divisionMethod === 'consumption' &&
                detailInvoice.items?.length ? (
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[color:var(--color-text-muted)]">
                      Items del consumo
                    </p>
                    <div className="space-y-1.5">
                      {detailInvoice.items.map((item) => {
                        const participants = item.participantIds
                          .map((id) => resolvePersonName(id, people))
                          .join(', ')
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-xl bg-[color:var(--color-surface-card)] border border-[color:var(--color-border-subtle)] px-3 py-2.5 text-sm"
                          >
                            <div>
                              <p className="font-medium text-[color:var(--color-text-main)]">{item.name}</p>
                              <p className="text-[10px] text-[color:var(--color-text-muted)]">
                                {item.quantity}× {currency} {item.unitPrice.toFixed(2)} · {participants || 'Sin participantes'}
                              </p>
                            </div>
                            <span className="font-semibold text-[color:var(--color-primary-main)]">
                              {currency} {getItemTotal(item).toFixed(2)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : null}

                {/* ── Shares ── */}
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[color:var(--color-text-muted)]">
                    Cuánto pone cada uno
                  </p>
                  <div className="space-y-1.5">
                    {shares.map((share) => (
                      <div
                        key={share.personId}
                        className={`flex items-center justify-between rounded-xl bg-[color:var(--color-surface-card)] border border-[color:var(--color-border-subtle)] px-3 py-2.5 ${
                          share.isBirthday ? 'ring-1 ring-[color:var(--color-primary-light)]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-surface-muted)] text-[11px] font-bold text-[color:var(--color-primary-main)]">
                            {resolvePersonName(share.personId, people).charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-[color:var(--color-text-main)]">
                            {resolvePersonName(share.personId, people)}
                          </span>
                          {share.isBirthday ? (
                            <span className="text-[10px]">🎂</span>
                          ) : null}
                        </div>
                        <div className="text-right">
                          {share.tipPortion ? (
                            <p className="text-[10px] text-[color:var(--color-accent-warning)]">
                              +{currency} {share.tipPortion.toFixed(2)} propina
                            </p>
                          ) : null}
                          <p className="text-sm font-bold text-[color:var(--color-primary-main)]">
                            {currency} {share.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
