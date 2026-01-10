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
  const peopleById = new Map(people.map((person) => [person.id, person.name]))
  const normalizedBalances = balances.map((balance) => ({
    ...balance,
    net: normalize(balance.net),
    name: peopleById.get(balance.personId) ?? 'Desconocido',
  }))
  const receivers = normalizedBalances
    .filter((balance) => balance.net > 0)
    .sort((a, b) => b.net - a.net)
  const payers = normalizedBalances
    .filter((balance) => balance.net < 0)
    .sort((a, b) => a.net - b.net)
  const settled = normalizedBalances.filter((balance) => balance.net === 0)

  return (
    <SectionCard
      title="Resumen por persona"
      description="Objetivo: entender quien queda a favor y quien debe, antes de ir a transferencias."
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
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-text-muted)]">
                Cobran
              </p>
              <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                Personas a quienes el grupo les debe.
              </p>
              <div className="mt-3 space-y-2">
                {receivers.length === 0 ? (
                  <p className="text-sm text-[color:var(--color-text-muted)]">
                    Nadie a favor por ahora.
                  </p>
                ) : (
                  receivers.map((balance) => (
                    <div
                      key={balance.personId}
                      className="flex items-center justify-between rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
                          {balance.name}
                        </p>
                        <p className="text-xs text-[color:var(--color-text-muted)]">
                          Pago {currency} {balance.totalPaid.toFixed(2)}
                        </p>
                      </div>
                      <AmountDisplay amount={balance.net} currency={currency} showSign />
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-text-muted)]">
                Deben
              </p>
              <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                Personas que deben pagar para equilibrar el grupo.
              </p>
              <div className="mt-3 space-y-2">
                {payers.length === 0 ? (
                  <p className="text-sm text-[color:var(--color-text-muted)]">
                    Nadie por debajo, todo esta equilibrado.
                  </p>
                ) : (
                  payers.map((balance) => (
                    <div
                      key={balance.personId}
                      className="flex items-center justify-between rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
                          {balance.name}
                        </p>
                        <p className="text-xs text-[color:var(--color-text-muted)]">
                          Debia {currency} {balance.totalOwed.toFixed(2)}
                        </p>
                      </div>
                      <AmountDisplay amount={balance.net} currency={currency} showSign />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {settled.length > 0 ? (
            <div className="rounded-xl border border-dashed border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-text-muted)]">
                En equilibrio
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {settled.map((balance) => (
                  <span
                    key={balance.personId}
                    className="rounded-full border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-3 py-1 text-xs font-semibold text-[color:var(--color-text-muted)]"
                  >
                    {balance.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </SectionCard>
  )
}
