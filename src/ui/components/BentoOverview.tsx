import { ArrowRight, Share2 } from 'lucide-react'
import type { Balance } from '../../domain/settlement/Balance'
import type { SettlementTransfer } from '../../domain/settlement/SettlementTransfer'
import type { TransferStatus } from '../../domain/settlement/TransferStatus'
import type { InvoiceForUI, PersonForUI } from '../../shared/state/fairsplitStore'
import { useAuthStore } from '../../shared/state/authStore'
import { toast } from '../../shared/components/ui/sonner'
import { Button } from '../../shared/components/ui/button'
import { Checkbox } from '../../shared/components/ui/checkbox'
import { AmountDisplay } from './AmountDisplay'

interface BentoOverviewProps {
  eventId: string
  people: PersonForUI[]
  invoices: InvoiceForUI[]
  balances: Balance[]
  transfers: SettlementTransfer[]
  transferStatusMap: Record<string, TransferStatus>
  settledByPersonId: Record<string, boolean>
  currency: string
}

export function BentoOverview({
  eventId,
  people,
  invoices,
  balances,
  transfers,
  transferStatusMap,
  settledByPersonId,
  currency,
}: BentoOverviewProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated())
  const totalInvoices = invoices.length
  const totalAmount = invoices.reduce((acc, inv) => acc + inv.amount, 0)
  const totalTips = invoices.reduce((acc, inv) => acc + (inv.tipAmount ?? 0), 0)
  const totalTransfers = transfers.length
  const settledTransfers = transfers.reduce((acc, transfer) => {
    const key = buildTransferKey(transfer.fromPersonId, transfer.toPersonId)
    return acc + (transferStatusMap[key]?.isSettled ? 1 : 0)
  }, 0)
  const pendingTransfers = totalTransfers - settledTransfers
  const previewInvoices = invoices.slice(0, 3)
  const previewBalances = balances.slice(0, 5)
  const orderedTransfers = [...transfers].sort((a, b) => {
    const aSettled = transferStatusMap[buildTransferKey(a.fromPersonId, a.toPersonId)]?.isSettled
    const bSettled = transferStatusMap[buildTransferKey(b.fromPersonId, b.toPersonId)]?.isSettled
    return Number(Boolean(aSettled)) - Number(Boolean(bSettled))
  })
  const previewTransfers = orderedTransfers.slice(0, 5)
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/events/${eventId}/overview`
      : ''

  const handleShare = async () => {
    if (typeof window === 'undefined' || !shareUrl) return
    const isMobile =
      window.matchMedia('(max-width: 640px)').matches ||
      /Mobi|Android/i.test(navigator.userAgent)
    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title: 'FairSplit',
          text: 'Vista general del evento',
          url: shareUrl,
        })
        return
      } catch {
        // Fallback to copy
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copiado al portapapeles.')
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = shareUrl
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(textarea)
      if (ok) {
        toast.success('Link copiado al portapapeles.')
      } else {
        toast.error('No se pudo copiar el link.')
      }
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="animate-fade-in rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-4 md:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
              Vista general
            </p>
            <h4 className="text-lg font-semibold text-[color:var(--color-text-main)]">
              Estado del evento
            </h4>
            <p className="text-sm text-[color:var(--color-text-muted)]">
              Lo esencial para cerrar cuentas sin abrir mas pantallas.
            </p>
          </div>
          <div className="flex flex-1 flex-wrap items-center gap-2 text-xs sm:justify-end">
            <span className="ds-badge-soft">Integrantes: {people.length}</span>
            <span className="ds-badge-soft">Gastos: {totalInvoices}</span>
            <span className="ds-badge-soft">
              Total: {currency} {roundToCents(totalAmount).toFixed(2)}
            </span>
            {totalTransfers > 0 ? (
              <span className="ds-badge-soft">Pendientes: {pendingTransfers}</span>
            ) : null}
            {totalTips > 0 ? (
              <span className="ds-badge-soft">
                Propina: {currency} {roundToCents(totalTips).toFixed(2)}
              </span>
            ) : null}
            {isAuthenticated ? (
              <Button
                type="button"
                size="sm"
                variant="soft"
                className="ml-auto"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Compartir
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="animate-fade-in rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-semibold text-[color:var(--color-text-main)]">Integrantes</h4>
          <span className="ds-badge-soft">{people.length}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {people.length === 0 ? (
            <span className="text-sm text-[color:var(--color-text-muted)]">
              Aun no hay integrantes.
            </span>
          ) : (
            people.map((p) => (
              <span key={p.id} className="rounded-full ds-tag">
                {p.name}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="animate-fade-in rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-semibold text-[color:var(--color-text-main)]">Gastos</h4>
          <div className="flex items-center gap-2 text-xs text-[color:var(--color-text-muted)]">
            <span className="ds-badge-soft">{totalInvoices}</span>
            Acumulado: {currency} {roundToCents(totalAmount).toFixed(2)}
          </div>
        </div>
        {totalTips > 0 ? (
          <p className="mb-3 text-xs text-[color:var(--color-text-muted)]">
            Propina: {currency} {roundToCents(totalTips).toFixed(2)}
          </p>
        ) : null}
        <div className="space-y-2">
          {invoices.length === 0 ? (
            <span className="text-sm text-[color:var(--color-text-muted)]">
              Aun no hay gastos.
            </span>
          ) : (
            previewInvoices.map((inv) => (
              <div
                key={inv.id}
                className="rounded-md border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] p-3 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[color:var(--color-text-main)]">
                      {inv.description}
                    </p>
                    <p className="text-[color:var(--color-text-muted)]">
                      Pago: {resolvePersonName(inv.payerId, people)} - Personas:{' '}
                      {inv.participantIds.length}
                    </p>
                  </div>
                  <span className="ds-badge-soft">
                    {currency} {inv.amount.toFixed(2)}
                  </span>
                </div>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-[color:var(--color-text-muted)]">
                  Reparto: {inv.divisionMethod === 'consumption' ? 'Consumo real' : 'Equitativo'}
                </p>
                {inv.birthdayPersonId ? (
                  <p className="mt-1 text-[11px] font-semibold text-[color:var(--color-primary-main)]">
                    Invitado especial: {resolvePersonName(inv.birthdayPersonId, people)}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="animate-fade-in rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-4">
        <div className="mb-3">
          <h4 className="font-semibold text-[color:var(--color-text-main)]">Balance del grupo</h4>
          <p className="text-xs text-[color:var(--color-text-muted)]">
            Quien queda a favor y quien debe.
          </p>
        </div>
        <div className="space-y-2">
          {balances.length === 0 ? (
            <span className="text-sm text-[color:var(--color-text-muted)]">
              Sin saldos: aun no hay gastos.
            </span>
          ) : (
            previewBalances.map((b) => (
              <div
                key={b.personId}
                className="flex items-center justify-between rounded-md border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] p-3 text-xs"
              >
                <div>
                  <p className="font-semibold text-[color:var(--color-text-main)]">
                    {resolvePersonName(b.personId, people)}
                  </p>
                  <p className="text-[color:var(--color-text-muted)]">
                    {b.net > 0 ? 'A favor' : b.net < 0 ? 'Debe' : 'En cero'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={Boolean(settledByPersonId[b.personId])}
                    disabled
                    aria-label={`Transferencias completadas: ${resolvePersonName(b.personId, people)}`}
                  />
                  <AmountDisplay amount={b.net} currency={currency} showSign />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="animate-fade-in rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-4">
        <div className="mb-3">
          <h4 className="font-semibold text-[color:var(--color-text-main)]">Pagos sugeridos</h4>
          <p className="text-xs text-[color:var(--color-text-muted)]">
            Quien paga a quien (solo lectura)
            {totalTips > 0
              ? ` - Propina incluida: ${currency} ${roundToCents(totalTips).toFixed(2)}`
              : ''}
          </p>
        </div>
        <div className="space-y-2">
          {transfers.length === 0 ? (
            <span className="text-sm text-[color:var(--color-text-muted)]">
              No hay deudas pendientes, todo esta balanceado.
            </span>
          ) : (
            previewTransfers.map((t, idx) => (
              <div
                key={`${t.fromPersonId}-${t.toPersonId}-${idx}`}
                className="flex items-center justify-between rounded-md border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] p-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={Boolean(transferStatusMap[buildTransferKey(t.fromPersonId, t.toPersonId)]?.isSettled)}
                    disabled
                    aria-label={`Transferencia completada: ${resolvePersonName(t.fromPersonId, people)} a ${resolvePersonName(t.toPersonId, people)}`}
                  />
                  <span className="font-semibold text-[color:var(--color-text-main)]">
                    {resolvePersonName(t.fromPersonId, people)}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[color:var(--color-text-muted)]" />
                  <span className="font-semibold text-[color:var(--color-primary-main)]">
                    {resolvePersonName(t.toPersonId, people)}
                  </span>
                </div>
                <AmountDisplay amount={t.amount} currency={currency} showSign={false} />
              </div>
            ))
          )}
        </div>
        {transfers.length > previewTransfers.length ? (
          <p className="mt-3 text-xs text-[color:var(--color-text-muted)]">
            Hay mas transferencias en la pestana Transferencias.
          </p>
        ) : null}
      </div>
    </div>
  )
}

function resolvePersonName(id: string, people: PersonForUI[]) {
  return people.find((person) => person.id === id)?.name ?? 'Desconocido'
}

function buildTransferKey(fromPersonId: string, toPersonId: string) {
  return `${fromPersonId}::${toPersonId}`
}

const roundToCents = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100
