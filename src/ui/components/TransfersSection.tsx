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

  return (
    <SectionCard
      title="Transferencias sugeridas"
      description="Pagos simples para saldar los saldos netos."
      action={
        tipTotal && tipTotal > 0 ? (
          <span className="ds-badge-soft whitespace-normal break-words text-left">
            Incluye propina: {currency} {tipTotal.toFixed(2)}
          </span>
        ) : null
      }
    >
      {hasTransfers ? (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                <th className="px-3 py-2 w-10"></th>
                <th className="px-3 py-2">De</th>
                <th className="px-3 py-2 text-center"></th>
                <th className="px-3 py-2">Hacia</th>
                <th className="px-3 py-2 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--color-border-subtle)]">
              {transfers.map((transfer, index) => (
                <tr
                  key={`${transfer.fromPersonId}-${transfer.toPersonId}-${index}`}
                  className="transition hover:bg-[color:var(--color-surface-muted)]"
                >
                  <td className="px-3 py-3">
                    <Checkbox
                      checked={isSettled(transfer)}
                      onCheckedChange={(checked) =>
                        onToggleStatus(transfer, Boolean(checked))
                      }
                      aria-label="Marcar transferencia como realizada"
                    />
                  </td>
                  <td className="px-3 py-3 font-semibold text-[color:var(--color-text-main)]">
                    {resolvePersonName(transfer.fromPersonId, people)}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <ArrowRight className="inline h-4 w-4 text-[color:var(--color-text-muted)]" />
                  </td>
                  <td className="px-3 py-3 font-semibold text-[color:var(--color-primary-main)]">
                    {resolvePersonName(transfer.toPersonId, people)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <AmountDisplay amount={transfer.amount} currency={currency} showSign={false} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
