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

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Participantes</h3>
        <p className="text-xs text-slate-600">Total: {people.length}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {people.length === 0 ? (
            <span className="text-sm text-slate-600">
              Aún no hay participantes.
            </span>
          ) : (
            people.map((p) => (
              <span
                key={p.id}
                className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
              >
                {p.name}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Facturas</h3>
        <p className="text-xs text-slate-600">
          Total: {totalInvoices} · Suma: {currency} {totalAmount.toFixed(2)}
        </p>
        <div className="mt-2 space-y-2">
          {invoices.length === 0 ? (
            <span className="text-sm text-slate-600">
              Aún no hay facturas.
            </span>
          ) : (
            invoices.slice(0, 4).map((inv) => (
              <div
                key={inv.id}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm"
              >
                <p className="font-semibold text-slate-900">{inv.description}</p>
                <p className="text-slate-600">
                  Pago: {resolvePersonName(inv.payerId, people)} · {currency}{' '}
                  {inv.amount.toFixed(2)} · Part: {inv.participantIds.length}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Saldos</h3>
        <p className="text-xs text-slate-600">
          Resumen por persona (solo lectura)
        </p>
        <div className="mt-2 space-y-2">
          {balances.length === 0 ? (
            <span className="text-sm text-slate-600">
              Sin saldos, aún no hay facturas.
            </span>
          ) : (
            balances.map((b) => {
              const net = normalize(b.net)
              return (
                <div
                  key={b.personId}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {resolvePersonName(b.personId, people)}
                    </p>
                    <p className="text-slate-600">
                      Pagado: {currency} {b.totalPaid.toFixed(2)} · Debía:{' '}
                      {currency} {b.totalOwed.toFixed(2)}
                    </p>
                  </div>
                  <span
                    className={`font-semibold ${
                      net > 0
                        ? 'text-emerald-700'
                        : net < 0
                        ? 'text-red-700'
                        : 'text-slate-700'
                    }`}
                  >
                    {net > 0 ? '⬆ ' : net < 0 ? '⬇ ' : ''}
                    {currency} {net.toFixed(2)}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">
          Transferencias sugeridas
        </h3>
        <p className="text-xs text-slate-600">
          Deudores → Acreedores (solo lectura)
        </p>
        <div className="mt-2 space-y-2">
          {transfers.length === 0 ? (
            <span className="text-sm text-slate-600">
              No hay deudas pendientes, todo está equilibrado.
            </span>
          ) : (
            transfers.map((t, idx) => (
              <div
                key={`${t.fromPersonId}-${t.toPersonId}-${idx}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm"
              >
                <span className="font-semibold text-slate-900">
                  {resolvePersonName(t.fromPersonId, people)}
                </span>
                <span className="text-slate-500">→</span>
                <span className="font-semibold text-slate-900">
                  {resolvePersonName(t.toPersonId, people)}
                </span>
                <span className="font-semibold text-indigo-700">
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
