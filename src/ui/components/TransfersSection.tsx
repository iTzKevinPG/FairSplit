import type { SettlementTransfer } from '../../domain/transfer'
import type { PersonForUI } from '../../state/fairsplitStore'
import { SectionCard } from './SectionCard'

interface TransfersSectionProps {
  transfers: SettlementTransfer[]
  people: PersonForUI[]
  currency: string
}

export function TransfersSection({
  transfers,
  people,
  currency,
}: TransfersSectionProps) {
  const hasTransfers = transfers.length > 0

  return (
    <SectionCard
      title="Transferencias sugeridas"
      description="Pagos simples para saldar los saldos netos."
    >
      {hasTransfers ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">De</th>
                <th className="px-3 py-2">Hacia</th>
                <th className="px-3 py-2">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transfers.map((transfer, index) => (
                <tr key={`${transfer.fromPersonId}-${transfer.toPersonId}-${index}`}>
                  <td className="px-3 py-2 font-semibold text-slate-900">
                    {resolvePersonName(transfer.fromPersonId, people)}
                  </td>
                  <td className="px-3 py-2 font-semibold text-slate-900">
                    {resolvePersonName(transfer.toPersonId, people)}
                  </td>
                  <td className="px-3 py-2 font-semibold text-indigo-700">
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
