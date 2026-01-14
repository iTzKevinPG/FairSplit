import { ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react'
import { ActionMenu } from '../../../shared/components/ActionMenu'
import { Button } from '../../../shared/components/ui/button'
import type { InvoiceItem } from '../../../domain/invoice/Invoice'
import type { InvoiceForUI, PersonForUI } from '../../../shared/state/fairsplitStore'

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
  onCloseDetail: () => void
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
  onCloseDetail,
  onEdit,
  onRemove,
  resolvePersonName,
  getItemTotal,
}: InvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-6 text-center">
        <p className="text-sm text-[color:var(--color-text-muted)]">
          Aun no has registrado gastos. Usa "Agregar gasto" para crear el primero.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {invoices.map((invoice) => {
        const isExpanded = detailInvoiceId === invoice.id
        const shares = isExpanded && detailInvoice ? participantShares : []

        return (
          <div
            key={invoice.id}
            className="card-interactive rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)]"
          >
            <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[color:var(--color-text-main)]">
                    {invoice.description}
                  </p>
                  <span className="ds-badge-soft">
                    {currency} {invoice.amount.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-[color:var(--color-text-muted)]">
                  Pago: {resolvePersonName(invoice.payerId, people)}
                </p>
                <p className="text-xs text-[color:var(--color-text-muted)]">
                  Personas ({invoice.participantIds.length}):{' '}
                  {invoice.participantIds
                    .map((id) => resolvePersonName(id, people))
                    .join(', ')}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-[color:var(--color-text-muted)]">
                  Reparto:{' '}
                  {invoice.divisionMethod === 'consumption' ? 'Consumo real' : 'Equitativo'}
                </p>
                {invoice.divisionMethod === 'consumption' && invoice.items?.length ? (
                  <p className="text-xs text-[color:var(--color-text-muted)]">
                    Items: {invoice.items.slice(0, 2).map((item) => item.name).join(', ')}
                    {invoice.items.length > 2 ? ` - +${invoice.items.length - 2} mas` : ''}
                  </p>
                ) : null}
                {invoice.tipAmount ? (
                  <p className="text-xs text-[color:var(--color-text-muted)]">
                    Propina: {currency} {invoice.tipAmount.toFixed(2)}
                  </p>
                ) : null}
              </div>
              <div className="ml-auto flex items-center gap-2 text-xs justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-[color:var(--color-primary-main)] hover:text-[color:var(--color-primary-dark)]"
                  onClick={() => onToggleDetail(invoice.id)}
                >
                  {isExpanded ? 'Ocultar' : 'Detalle'}
                  {isExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </Button>
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
            </div>

            {isExpanded && detailInvoice ? (
              <div className="animate-fade-in border-t border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-panel)] p-4 text-sm text-[color:var(--color-text-main)] shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-[color:var(--color-text-main)]">
                      {detailInvoice.description}
                    </p>
                    <p className="text-xs text-[color:var(--color-text-muted)]">
                      Pago: {resolvePersonName(detailInvoice.payerId, people)} - Monto:{' '}
                      {currency} {detailInvoice.amount.toFixed(2)}
                      {detailInvoice.tipAmount
                        ? ` - Propina: ${currency} ${detailInvoice.tipAmount.toFixed(2)}`
                        : ''}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-[color:var(--color-text-muted)]">
                      Reparto:{' '}
                      {detailInvoice.divisionMethod === 'consumption'
                        ? 'Consumo real'
                        : 'Equitativo'}
                    </p>
                    {detailInvoice.birthdayPersonId ? (
                      <p className="text-[11px] font-semibold text-[color:var(--color-primary-main)]">
                        Invitado especial:{' '}
                        {resolvePersonName(detailInvoice.birthdayPersonId, people)}
                      </p>
                    ) : null}
                  </div>
                </div>
                {detailInvoice.divisionMethod === 'consumption' &&
                detailInvoice.items?.length ? (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold text-[color:var(--color-text-main)]">
                      Items del consumo
                    </p>
                    <div className="space-y-2">
                      {detailInvoice.items.map((item) => {
                        const participants = item.participantIds
                          .map((id) => resolvePersonName(id, people))
                          .join(', ')
                        return (
                          <div
                            key={item.id}
                            className="rounded-md border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-3 py-2 shadow-xs"
                          >
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-semibold text-[color:var(--color-text-main)]">
                                {item.name}
                              </span>
                              <span className="text-[color:var(--color-primary-main)] font-semibold">
                                {currency} {getItemTotal(item).toFixed(2)}
                              </span>
                            </div>
                            <p className="text-[11px] text-[color:var(--color-text-muted)]">
                              Cantidad: {item.quantity} - Unitario: {currency}{' '}
                              {item.unitPrice.toFixed(2)}
                            </p>
                            <p className="text-[11px] text-[color:var(--color-text-muted)]">
                              Participantes:{' '}
                              {participants.length > 0 ? participants : 'Sin participantes'}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : null}
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-[color:var(--color-text-main)]">
                    Consumo por persona
                  </p>
                  {shares.map((share) => (
                    <div
                      key={share.personId}
                      className={`flex items-center justify-between rounded-md border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-3 py-2 shadow-xs ${
                        share.isBirthday ? 'border-[color:var(--color-primary-light)]' : ''
                      }`}
                    >
                      <span className="font-semibold text-[color:var(--color-text-main)]">
                        {resolvePersonName(share.personId, people)}
                        {share.isBirthday ? (
                          <span className="ml-2 rounded-full accent-chip px-2 py-0.5 text-[10px] font-semibold text-accent">
                            Invitado especial
                          </span>
                        ) : null}
                      </span>
                      <div className="text-right">
                        {share.tipPortion ? (
                          <p className="text-[11px] text-[color:var(--color-text-muted)]">
                            Propina: {currency} {share.tipPortion.toFixed(2)}
                          </p>
                        ) : null}
                        <p className="text-[color:var(--color-primary-main)] font-semibold">
                          Total: {currency} {share.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
