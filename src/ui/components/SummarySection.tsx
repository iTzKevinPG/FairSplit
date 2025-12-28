import type { Balance } from '../../domain/settlement/Balance'
import type { PersonForUI } from '../../shared/state/fairsplitStore'
import { AmountDisplay } from './AmountDisplay'
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
      action={
        tipTotal && tipTotal > 0 ? (
          <span className="ds-badge-soft">
            Propina total: {currency} {tipTotal.toFixed(2)}
          </span>
        ) : null
      }
    >
      {balances.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-6 text-center">
          <p className="text-sm text-[color:var(--color-text-muted)]">
            Agrega facturas para ver el resumen.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                <th className="px-3 py-2">Persona</th>
                <th className="px-3 py-2 text-right">Pagado</th>
                <th className="px-3 py-2 text-right">Debia</th>
                <th className="px-3 py-2 text-right">Saldo neto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--color-border-subtle)] text-sm">
              {balances.map((balance) => {
                const personName =
                  people.find((person) => person.id === balance.personId)?.name ??
                  'Desconocido'
                const net = normalize(balance.net)
                return (
                  <tr key={balance.personId} className="transition hover:bg-[color:var(--color-surface-muted)]">
                    <td className="px-3 py-3 font-semibold text-[color:var(--color-text-main)]">
                      {personName}
                    </td>
                    <td className="px-3 py-3 text-right text-[color:var(--color-text-muted)] tabular-nums">
                      {currency} {balance.totalPaid.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-right text-[color:var(--color-text-muted)] tabular-nums">
                      {currency} {balance.totalOwed.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <AmountDisplay amount={net} currency={currency} showSign />
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
