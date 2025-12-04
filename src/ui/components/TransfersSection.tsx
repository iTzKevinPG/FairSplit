import type { SettlementTransfer } from '../../domain/settlement/SettlementTransfer'
import type { PersonForUI } from '../../shared/state/fairsplitStore'
import { SectionCard } from './SectionCard'

interface TransfersSectionProps {
  transfers: SettlementTransfer[]
  people: PersonForUI[]
  currency: string
  tipTotal?: number
}

export function TransfersSection({
  transfers,
  people,
  currency,
  tipTotal,
}: TransfersSectionProps) {
  const hasTransfers = transfers.length > 0

  return (
    <SectionCard
      title="Transferencias sugeridas"
      description="Pagos simples para saldar los saldos netos."
      actions={
        tipTotal && tipTotal > 0 ? (
          <span className="ds-badge-soft whitespace-normal break-words text-left">
            Incluye propina: {currency} {tipTotal.toFixed(2)}
          </span>
        ) : null
      }
    >
      {hasTransfers ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                <th className="px-3 py-2">De</th>
                <th className="px-3 py-2">Hacia</th>
                <th className="px-3 py-2">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transfers.map((transfer, index) => (
                <tr key={`${transfer.fromPersonId}-${transfer.toPersonId}-${index}`}>
                  <td className="px-3 py-2 font-semibold text-[color:var(--color-text-main)]">
                    {resolvePersonName(transfer.fromPersonId, people)}
                  </td>
                  <td className="px-3 py-2 font-semibold text-[color:var(--color-text-main)]">
                    {resolvePersonName(transfer.toPersonId, people)}
                  </td>
                  <td className="px-3 py-2 font-semibold text-accent">
                    {currency} {transfer.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-slate-600">
          No hay deudas pendientes, todo está equilibrado.
        </p>
      )}
    </SectionCard>
  )
}

function resolvePersonName(id: string, people: PersonForUI[]) {
  return people.find((person) => person.id === id)?.name ?? 'Desconocido'
}
