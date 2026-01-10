import { ArrowRight } from 'lucide-react'
import type { SettlementTransfer } from '../../domain/settlement/SettlementTransfer'
import type { PersonForUI } from '../../shared/state/fairsplitStore'
import { AmountDisplay } from './AmountDisplay'
import { SectionCard } from './SectionCard'
import { Checkbox } from '../../shared/components/ui/checkbox'

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
      title="Transferencias sugeridas"
      description="Objetivo: completar los pagos minimos para saldar el grupo."
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
                Marca como pagadas a medida que se completen.
              </p>
              <div className="mt-3 space-y-2">
                {pendingTransfers.length === 0 ? (
                  <p className="text-sm text-[color:var(--color-text-muted)]">
                    No quedan transferencias pendientes.
                  </p>
                ) : (
                  pendingTransfers.map((transfer, index) => (
                    <div
                      key={`${transfer.fromPersonId}-${transfer.toPersonId}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] px-3 py-2"
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
                Historial rapido de pagos realizados.
              </p>
              <div className="mt-3 space-y-2">
                {settledTransfers.length === 0 ? (
                  <p className="text-sm text-[color:var(--color-text-muted)]">
                    Aun no marcas transferencias como completadas.
                  </p>
                ) : (
                  settledTransfers.map((transfer, index) => (
                    <div
                      key={`${transfer.fromPersonId}-${transfer.toPersonId}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)]/60 px-3 py-2"
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
        <div className="rounded-lg border border-dashed border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-6 text-center">
          <p className="text-sm text-[color:var(--color-text-muted)]">
            No hay transferencias pendientes. Todos los saldos estan cubiertos.
          </p>
        </div>
      )}
    </SectionCard>
  )
}

function resolvePersonName(id: string, people: PersonForUI[]) {
  return people.find((person) => person.id === id)?.name ?? 'Desconocido'
}
