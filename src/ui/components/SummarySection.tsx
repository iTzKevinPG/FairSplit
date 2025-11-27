import type { Balance } from '../../domain/balance'
import type { PersonForUI } from '../../state/fairsplitStore'
import { SectionCard } from './SectionCard'

interface SummarySectionProps {
  balances: Balance[]
  people: PersonForUI[]
  currency: string
}

export function SummarySection({
  balances,
  people,
  currency,
}: SummarySectionProps) {
  return (
    <SectionCard
      title="Resumen por persona"
      description="Saldos netos por persona: positivo significa que le deben; negativo, que debe."
    >
      {balances.length === 0 ? (
        <p className="text-sm text-slate-600">
          Agrega facturas para ver el resumen.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Persona</th>
                <th className="px-3 py-2">Pagado</th>
                <th className="px-3 py-2">Debia</th>
                <th className="px-3 py-2">Saldo neto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {balances.map((balance) => {
                const personName =
                  people.find((person) => person.id === balance.personId)?.name ??
                  'Desconocido'
                return (
                  <tr key={balance.personId}>
                    <td className="px-3 py-2 font-semibold text-slate-900">
                      {personName}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {currency} {balance.totalPaid.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {currency} {balance.totalOwed.toFixed(2)}
                    </td>
                    <td
                      className={`px-3 py-2 font-semibold ${
                        balance.net > 0
                          ? 'text-emerald-700'
                          : balance.net < 0
                          ? 'text-red-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {currency} {balance.net.toFixed(2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  )
}
