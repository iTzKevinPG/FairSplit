import { createPortal } from 'react-dom'
import { Button } from '../../../shared/components/ui/button'
import type { InvoiceItem } from '../../../domain/invoice/Invoice'

interface OcrDecisionModalProps {
  open: boolean
  warnings: string[]
  description: string
  currency: string
  amount: string
  includeTip: boolean
  tipAmount: string
  items: InvoiceItem[]
  divisionMethod: 'equal' | 'consumption'
  scanIsGuest: boolean
  scanPreviewOpen: boolean
  rescanConfirmOpen: boolean
  onTogglePreview: () => void
  onSelectEqual: () => void
  onSelectConsumption: () => void
  onOpenRescanConfirm: () => void
  onCancelRescan: () => void
  onConfirmRescan: () => void
}

export function OcrDecisionModal({
  open,
  warnings,
  description,
  currency,
  amount,
  includeTip,
  tipAmount,
  items,
  divisionMethod,
  scanIsGuest,
  scanPreviewOpen,
  rescanConfirmOpen,
  onTogglePreview,
  onSelectEqual,
  onSelectConsumption,
  onOpenRescanConfirm,
  onCancelRescan,
  onConfirmRescan,
}: OcrDecisionModalProps) {
  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label="Vista previa de lectura"
      >
        <div className="space-y-4">
          {warnings.length > 0 ? (
            <div className="rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)]/60 px-4 py-3 text-xs text-[color:var(--color-text-muted)]">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[color:var(--color-primary-main)]">
                Avisos de la lectura
              </p>
              {warnings.map((warning, index) => (
                <p key={index}>{warning}</p>
              ))}
            </div>
          ) : null}

          <div className="rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)]/60 px-4 py-3 text-xs text-[color:var(--color-text-muted)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
                Lectura lista. Revisa el detalle si lo necesitas.
              </p>
              <Button type="button" variant="outline" size="sm" onClick={onTogglePreview}>
                {scanPreviewOpen ? 'Ocultar vista previa' : 'Ver vista previa'}
              </Button>
            </div>
            {scanPreviewOpen ? (
              <div className="mt-3 space-y-1">
                <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
                  {description || 'Consumo'}
                </p>
                <p>
                  Total: {currency} {amount || '0.00'}
                  {includeTip && tipAmount
                    ? ` - Propina: ${currency} ${tipAmount}`
                    : ''}
                </p>
                {items.length > 0 ? (
                  <p>
                    Items detectados: {items.slice(0, 3).map((item) => item.name).join(', ')}
                    {items.length > 3 ? ` - +${items.length - 3} mas` : ''}
                  </p>
                ) : (
                  <p>No se detectaron items.</p>
                )}
                {includeTip && tipAmount ? (
                  <p>La propina se guarda aparte del gasto.</p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)]/60 px-4 py-4 text-xs text-[color:var(--color-text-muted)]">
            <p className="mb-3 text-sm font-semibold text-[color:var(--color-text-main)]">
              Como quieres repartir este gasto?
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Button type="button" variant="soft" className="h-12 w-full text-sm" onClick={onSelectEqual}>
                Equitativo
              </Button>
              <Button
                type="button"
                variant="soft"
                className="h-12 w-full text-sm"
                onClick={onSelectConsumption}
              >
                Consumo real
              </Button>
              <Button type="button" variant="soft" className="h-12 w-full text-sm" onClick={onOpenRescanConfirm}>
                Reescanear
              </Button>
            </div>
            {items.length > 0 ? (
              <p className="mt-2">
                Se detectaron items. Elige "Consumo real" para asignar participantes.
              </p>
            ) : null}
            {divisionMethod === 'consumption' && items.length === 0 ? (
              <p className="mt-2">No se detectaron items. Puedes agregarlos manualmente.</p>
            ) : null}
          </div>

          {rescanConfirmOpen ? (
            <div className="rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)]/60 px-4 py-4 text-xs text-[color:var(--color-text-muted)]">
              <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
                Vas a reemplazar la lectura actual.
              </p>
              <p className="mt-1">
                {scanIsGuest
                  ? 'En modo local deberas volver a subir la factura.'
                  : 'Sube nuevamente la factura para generar una nueva lectura.'}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                <Button type="button" variant="ghost" onClick={onCancelRescan}>
                  Cancelar
                </Button>
                <Button type="button" variant="default" onClick={onConfirmRescan}>
                  Reescanear ahora
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  )
}
