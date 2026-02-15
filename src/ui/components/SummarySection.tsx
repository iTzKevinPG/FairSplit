import type { Balance } from '../../domain/settlement/Balance'
import type { InvoiceForUI, PersonForUI } from '../../shared/state/fairsplitStore'
import { AmountDisplay } from './AmountDisplay'
import { SectionCard } from './SectionCard'
import { EmptyStateIllustration } from './EmptyStateIllustration'

interface SummarySectionProps {
  balances: Balance[]
  people: PersonForUI[]
  invoices: InvoiceForUI[]
  currency: string
  tipTotal?: number
}

export function SummarySection({
  balances,
  people,
  invoices,
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
  const items = invoices.flatMap((invoice) => invoice.items ?? [])
  const itemNames = items.map((item) => item.name)
  const itemPreview = itemNames.slice(0, 3).join(', ')
  const remainingItems = Math.max(0, itemNames.length - 3)
  const subtotal = invoices.reduce((acc, inv) => acc + inv.amount, 0)
  const tips = tipTotal ?? 0
  const grandTotal = subtotal + tips

  return (
    <SectionCard
      title="¿Quién debe qué?"
      description="Acá ves quién puso de más y quién se quedó corto."
    >
      {balances.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-8 text-center">
          <EmptyStateIllustration variant="summary" />
          <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
            Nada que mostrar todavía
          </p>
          <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
            Agrega un gasto y acá verás quién debe y quién cobra. ✨
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Totals summary card */}
          <div className="rounded-xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] p-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-[color:var(--color-text-muted)]">
                  <span>Gastos:</span>
                  <span className="font-semibold text-[color:var(--color-text-main)]">
                    {currency} {subtotal.toFixed(2)}
                  </span>
                </div>
                {tips > 0 && (
                  <div className="flex items-center gap-2 text-sm text-[color:var(--color-text-muted)]">
                    <span>Propinas:</span>
                    <span className="font-semibold text-[color:var(--color-accent-warning)]">
                      + {currency} {tips.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[color:var(--color-text-muted)]">
                  Total del evento
                </p>
                <p className="text-xl font-bold text-[color:var(--color-primary-main)]">
                  {currency} {grandTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {itemNames.length > 0 ? (
            <div className="rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] px-4 py-3 text-sm text-[color:var(--color-text-muted)]">
              <span className="font-semibold text-[color:var(--color-text-main)]">
                Items registrados:
              </span>{' '}
              {itemPreview}
              {remainingItems > 0 ? ` · +${remainingItems} más` : ''}
            </div>
          ) : null}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-text-muted)]">
                Les deben 💰
              </p>
              <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                Pusieron más de lo que les tocaba.
              </p>
              <div className="mt-3 space-y-2">
                {receivers.length === 0 ? (
                  <p className="text-sm text-[color:var(--color-text-muted)]">
                    Nadie a favor por ahora.
                  </p>
                ) : (
                  receivers.map((balance, index) => (
                    <div
                      key={balance.personId}
                      className="animate-stagger-fade-in flex items-center justify-between rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] px-3 py-2"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div>
                        <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
                          {balance.name}
                        </p>
                         <p className="text-xs text-[color:var(--color-text-muted)]">
                           Pagó {currency} {balance.totalPaid.toFixed(2)}
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
                Deben poner 🙋
              </p>
              <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                Gastaron más de lo que pagaron.
              </p>
              <div className="mt-3 space-y-2">
                {payers.length === 0 ? (
                  <p className="text-sm text-[color:var(--color-text-muted)]">
                    Nadie por debajo, todo esta equilibrado.
                  </p>
                ) : (
                  payers.map((balance, index) => (
                    <div
                      key={balance.personId}
                      className="animate-stagger-fade-in flex items-center justify-between rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] px-3 py-2"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div>
                        <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
                          {balance.name}
                        </p>
                        <p className="text-xs text-[color:var(--color-text-muted)]">
                          Debía {currency} {balance.totalOwed.toFixed(2)}
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
                En paz ✅
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
