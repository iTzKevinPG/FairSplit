import { ArrowRight } from 'lucide-react'
import type { SettlementTransfer } from '../../domain/settlement/SettlementTransfer'
import type { PersonForUI } from '../../shared/state/fairsplitStore'
import { AmountDisplay } from './AmountDisplay'
import { SectionCard } from './SectionCard'
import { Checkbox } from '../../shared/components/ui/checkbox'
import { EmptyStateIllustration } from './EmptyStateIllustration'

type TransferStatusMap = Record<string, { isSettled: boolean }>

interface TransfersSectionProps {
  transfers: SettlementTransfer[]
  people: PersonForUI[]
  currency: string
  tipTotal?: number
  transferStatusMap: TransferStatusMap
  onToggleStatus: (transfer: SettlementTransfer, isSettled: boolean) => void
}

export function TransfersSection({
  transfers,
  people,
  currency,
  tipTotal,
  transferStatusMap,
  onToggleStatus,
}: TransfersSectionProps) {
  const hasTransfers = transfers.length > 0

  const isSettled = (transfer: SettlementTransfer) => {
    const key = `${transfer.fromPersonId}::${transfer.toPersonId}`
    return Boolean(transferStatusMap[key]?.isSettled)
  }
  const pendingTransfers = transfers.filter((transfer) => !isSettled(transfer))
  const settledTransfers = transfers.filter((transfer) => isSettled(transfer))

  return (
    <SectionCard
      title="¿Quién paga a quién?"
      description="Los pagos mínimos para que todos queden a mano."
      action={
        tipTotal && tipTotal > 0 ? (
          <span className="ds-badge-soft whitespace-normal break-words text-left">
            Incluye propina: {currency} {tipTotal.toFixed(2)}
          </span>
        ) : null
      }
    >
      {hasTransfers ? (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-text-muted)]">
                Pendientes
              </p>
              <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                Marca cada pago cuando se haga.
              </p>
              <div className="mt-3 space-y-2">
                {pendingTransfers.length === 0 ? (
                  <p className="text-sm text-[color:var(--color-text-muted)]">
                    ¡No queda nada pendiente! 🎉
                  </p>
                ) : (
                  pendingTransfers.map((transfer, index) => (
                     <div
                      key={`${transfer.fromPersonId}-${transfer.toPersonId}-${index}`}
                      className="animate-stagger-fade-in flex items-center justify-between gap-3 rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] px-3 py-2"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={false}
                          onCheckedChange={(checked) =>
                            onToggleStatus(transfer, Boolean(checked))
                          }
                          aria-label="Marcar transferencia como realizada"
                        />
                        <div>
                          <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
                            {resolvePersonName(transfer.fromPersonId, people)}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-[color:var(--color-text-muted)]">
                            <ArrowRight className="h-3.5 w-3.5" />
                            <span>{resolvePersonName(transfer.toPersonId, people)}</span>
                          </div>
                        </div>
                      </div>
                      <AmountDisplay amount={transfer.amount} currency={currency} showSign={false} />
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-text-muted)]">
                Completadas
              </p>
               <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                Pagos ya realizados.
              </p>
              <div className="mt-3 space-y-2">
                {settledTransfers.length === 0 ? (
                  <p className="text-sm text-[color:var(--color-text-muted)]">
                    Aún no hay pagos completados.
                  </p>
                ) : (
                  settledTransfers.map((transfer, index) => (
                     <div
                      key={`${transfer.fromPersonId}-${transfer.toPersonId}-${index}`}
                      className="animate-stagger-fade-in flex items-center justify-between gap-3 rounded-lg border border-dashed border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)]/60 px-3 py-2"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked
                          onCheckedChange={(checked) =>
                            onToggleStatus(transfer, Boolean(checked))
                          }
                          aria-label="Marcar transferencia como realizada"
                        />
                        <div>
                          <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
                            {resolvePersonName(transfer.fromPersonId, people)}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-[color:var(--color-text-muted)]">
                            <ArrowRight className="h-3.5 w-3.5" />
                            <span>{resolvePersonName(transfer.toPersonId, people)}</span>
                          </div>
                        </div>
                      </div>
                      <AmountDisplay amount={transfer.amount} currency={currency} showSign={false} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-8 text-center">
          <EmptyStateIllustration variant="transfers" />
           <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
            ¡Nadie debe nada!
          </p>
          <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
            Todos están a mano. ¡Bien hecho! 💪
          </p>
        </div>
      )}
    </SectionCard>
  )
}

function resolvePersonName(id: string, people: PersonForUI[]) {
  return people.find((person) => person.id === id)?.name ?? 'Desconocido'
}
