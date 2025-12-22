import type { Balance } from '../../domain/settlement/Balance'
import type { SettlementTransfer } from '../../domain/settlement/SettlementTransfer'
import type { InvoiceForUI, PersonForUI } from '../../shared/state/fairsplitStore'

interface BentoOverviewProps {
  people: PersonForUI[]
  invoices: InvoiceForUI[]
  balances: Balance[]
  transfers: SettlementTransfer[]
  currency: string
}

export function BentoOverview({
  people,
  invoices,
  balances,
  transfers,
  currency,
}: BentoOverviewProps) {
  const totalInvoices = invoices.length
  const totalAmount = invoices.reduce((acc, inv) => acc + inv.amount, 0)
  const totalTips = invoices.reduce((acc, inv) => acc + (inv.tipAmount ?? 0), 0)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="ds-card p-4">
        <h3 className="text-sm font-semibold text-[color:var(--color-text-main)]">
          Integrantes
        </h3>
        <p className="text-xs text-[color:var(--color-text-muted)]">Total: {people.length}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {people.length === 0 ? (
            <span className="text-sm text-[color:var(--color-text-muted)]">
              Aun no hay integrantes.
            </span>
          ) : (
            people.map((p) => (
              <span
                key={p.id}
                className="rounded-full ds-tag"
              >
                {p.name}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-[color:var(--color-text-main)]">Gastos</h3>
        <p className="text-xs text-[color:var(--color-text-muted)]">
          Total: {totalInvoices} · Acumulado: {currency} {totalAmount.toFixed(2)}{' '}
          {totalTips > 0 ? `· Propina: ${currency} ${totalTips.toFixed(2)}` : ''}
        </p>
        <div className="mt-2 space-y-2">
          {invoices.length === 0 ? (
            <span className="text-sm text-[color:var(--color-text-muted)]">
              Aun no hay gastos.
            </span>
          ) : (
            invoices.slice(0, 4).map((inv) => (
              <div
                key={inv.id}
                className="rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-3 py-2 text-xs shadow-sm"
              >
                <p className="font-semibold text-[color:var(--color-text-main)]">{inv.description}</p>
                <p className="text-[color:var(--color-text-muted)]">
                  Pagó: {resolvePersonName(inv.payerId, people)} · {currency}{' '}
                  {inv.amount.toFixed(2)} · Personas: {inv.participantIds.length}
                </p>
                {inv.birthdayPersonId ? (
                  <p className="text-[11px] font-semibold text-accent">
                    Cumpleañero: {resolvePersonName(inv.birthdayPersonId, people)}
                  </p>
                ) : null}
                {inv.tipAmount ? (
                  <p className="text-[11px] text-[color:var(--color-text-muted)]">
                    Propina: {currency} {inv.tipAmount.toFixed(2)}
                  </p>
                ) : null}
                <p className="text-[10px] uppercase tracking-wide text-[color:var(--color-text-muted)]">
                  Reparto:{' '}
                  {inv.divisionMethod === 'consumption' ? 'Consumo real' : 'Equitativo'}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-[color:var(--color-text-main)]">Balance del grupo</h3>
        <p className="text-xs text-[color:var(--color-text-muted)]">Resumen por persona</p>
        <div className="mt-2 space-y-2">
          {balances.length === 0 ? (
            <span className="text-sm text-[color:var(--color-text-muted)]">
              Sin saldos: aun no hay gastos.
            </span>
          ) : (
            balances.map((b) => {
              const net = normalize(b.net)
              return (
                <div
                  key={b.personId}
                  className="flex items-center justify-between rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-3 py-2 text-xs shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-[color:var(--color-text-main)]">
                      {resolvePersonName(b.personId, people)}
                    </p>
                    <p className="text-[color:var(--color-text-muted)]">
                      Pagado: {currency} {b.totalPaid.toFixed(2)} · Debe:{' '}
                      {currency} {b.totalOwed.toFixed(2)}
                    </p>
                  </div>
                  <span
                    className={`font-semibold ${
                      net > 0
                        ? 'text-[color:var(--color-accent-success)]'
                        : net < 0
                        ? 'text-[color:var(--color-accent-danger)]'
                        : 'text-slate-700'
                    }`}
                  >
                    {net > 0 ? '+ ' : net < 0 ? '- ' : ''}
                    {currency} {net.toFixed(2)}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-[color:var(--color-text-main)]">
          Pagos sugeridos
        </h3>
        <p className="text-xs text-[color:var(--color-text-muted)]">
          Quien paga a quien (solo lectura)
          {totalTips > 0 ? ` · Propina incluida: ${currency} ${totalTips.toFixed(2)}` : ''}
        </p>
        <div className="mt-2 space-y-2">
          {transfers.length === 0 ? (
            <span className="text-sm text-[color:var(--color-text-muted)]">
              No hay deudas pendientes, todo esta balanceado.
            </span>
          ) : (
            transfers.map((t, idx) => (
              <div
                key={`${t.fromPersonId}-${t.toPersonId}-${idx}`}
                className="flex items-center justify-between rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-3 py-2 text-xs shadow-sm"
              >
                <span className="font-semibold text-[color:var(--color-text-main)]">
                  {resolvePersonName(t.fromPersonId, people)}
                </span>
                <span className="text-[color:var(--color-text-muted)]">-&gt;</span>
                <span className="font-semibold text-[color:var(--color-text-main)]">
                  {resolvePersonName(t.toPersonId, people)}
                </span>
                <span className="font-semibold text-accent">
                  {currency} {t.amount.toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function resolvePersonName(id: string, people: PersonForUI[]) {
  return people.find((person) => person.id === id)?.name ?? 'Desconocido'
}

const normalize = (value: number) => (Math.abs(value) < 0.01 ? 0 : value)

