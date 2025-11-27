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
  return (
    <SectionCard
      title="Transferencias sugeridas"
      description="Pagos simples para saldar los saldos netos."
    >
      {transfers.length === 0 ? (
        <p className="text-sm text-slate-600">
          Sin transferencias pendientes. Agrega facturas o personas para ver el
          resultado.
        </p>
      ) : (
        <ul className="space-y-2 text-sm text-slate-800">
          {transfers.map((transfer, index) => (
            <li
              key={`${transfer.fromPersonId}-${transfer.toPersonId}-${index}`}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">
                  {resolvePersonName(transfer.fromPersonId, people)}
                </span>
                <span className="text-slate-500">paga a</span>
                <span className="font-semibold text-slate-900">
                  {resolvePersonName(transfer.toPersonId, people)}
                </span>
              </div>
              <span className="font-semibold text-indigo-700">
                {currency} {transfer.amount.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}

function resolvePersonName(id: string, people: PersonForUI[]) {
  return people.find((person) => person.id === id)?.name ?? 'Desconocido'
}
