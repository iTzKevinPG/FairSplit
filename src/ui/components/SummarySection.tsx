import type { Balance } from '../../domain/settlement/Balance'
import type { PersonForUI } from '../../shared/state/fairsplitStore'
import { SectionCard } from './SectionCard'

interface SummarySectionProps {
  balances: Balance[]
  people: PersonForUI[]
  currency: string
  tipTotal?: number
}

export function SummarySection({
  balances,
  people,
  currency,
  tipTotal,
}: SummarySectionProps) {
  const normalize = (value: number) =>
    Math.abs(value) < 0.01 ? 0 : value

  return (
    <SectionCard
      title="Resumen por persona"
      description="Saldos netos por persona: positivo significa que le deben; negativo, que debe."
      actions={
        tipTotal && tipTotal > 0 ? (
          <span className="ds-badge-soft">
            Propina total: {currency} {tipTotal.toFixed(2)}
          </span>
        ) : null
      }
    >
      {balances.length === 0 ? (
        <p className="text-sm text-slate-600">
          Agrega facturas para ver el resumen.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
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
                const net = normalize(balance.net)
                return (
                  <tr key={balance.personId}>
                    <td className="px-3 py-2 font-semibold text-[color:var(--color-text-main)]">
                      {personName}
                    </td>
                    <td className="px-3 py-2 text-[color:var(--color-text-main)]">
                      {currency} {balance.totalPaid.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-[color:var(--color-text-main)]">
                      {currency} {balance.totalOwed.toFixed(2)}
                    </td>
                    <td
                      className={`px-3 py-2 font-semibold ${
                        net > 0
                          ? 'text-emerald-700'
                          : net < 0
                          ? 'text-red-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {net > 0 ? '⬆ ' : net < 0 ? '⬇ ' : ''}
                      {currency} {net.toFixed(2)}
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
