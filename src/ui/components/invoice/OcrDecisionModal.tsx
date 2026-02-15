import { createPortal } from 'react-dom'
import { AlertTriangle, Split, Users, RefreshCw } from 'lucide-react'
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
  rescanConfirmOpen: boolean
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
  rescanConfirmOpen,
  onSelectEqual,
  onSelectConsumption,
  onOpenRescanConfirm,
  onCancelRescan,
  onConfirmRescan,
}: OcrDecisionModalProps) {
  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
      <div
        className="animate-fade-in relative w-full max-w-lg rounded-t-3xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-5 shadow-[var(--shadow-lg)] sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Vista previa de lectura"
      >
        {/* Header */}
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-primary-main)]">
            Lectura de factura
          </p>
          <h2 className="text-lg font-semibold text-[color:var(--color-text-main)]">
            Revisa el detalle 📋
          </h2>
        </div>

        <div className="space-y-4">
          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="ds-alert ds-alert-warning flex-col !items-start gap-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-[color:var(--color-accent-warning)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em]">
                  Avisos de la lectura
                </span>
              </div>
              <ul className="mt-1 space-y-0.5 pl-6 text-xs text-[color:var(--color-text-muted)]">
                {warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary card */}
          <div className="rounded-xl bg-[color:var(--color-primary-soft)] px-4 py-3">
            <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
              {description || 'Consumo'}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold text-[color:var(--color-primary-main)]">
                {currency} {amount || '0.00'}
              </span>
              {includeTip && tipAmount && (
                <span className="accent-chip">
                  🎩 Propina: {currency} {tipAmount}
                </span>
              )}
            </div>
            {items.length > 0 && (
              <p className="mt-2 text-xs text-[color:var(--color-text-muted)]">
                📦 {items.length} item{items.length !== 1 ? 's' : ''} detectado{items.length !== 1 ? 's' : ''}:{' '}
                {items.slice(0, 3).map((item) => item.name).join(', ')}
                {items.length > 3 ? ` (+${items.length - 3} más)` : ''}
              </p>
            )}
            {items.length === 0 && (
              <p className="mt-2 text-xs text-[color:var(--color-text-muted)]">
                No se detectaron items.
              </p>
            )}
            {includeTip && tipAmount && (
              <p className="mt-1 text-[11px] text-[color:var(--color-text-muted)]">
                La propina se guarda aparte del gasto.
              </p>
            )}
          </div>

          {/* Division method selection */}
          <div>
            <p className="mb-3 text-sm font-semibold text-[color:var(--color-text-main)]">
              ¿Cómo repartimos este gasto? 🤔
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={onSelectEqual}
                className="card-interactive flex flex-col items-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-3 py-3.5 text-center shadow-[var(--shadow-sm)] transition-all hover:border-[color:var(--color-primary-light)]"
              >
                <Users className="h-5 w-5 text-[color:var(--color-primary-main)]" />
                <span className="text-sm font-semibold text-[color:var(--color-text-main)]">Partes iguales</span>
                <span className="text-[11px] text-[color:var(--color-text-muted)]">Todos pagan lo mismo</span>
              </button>
              <button
                type="button"
                onClick={onSelectConsumption}
                className="card-interactive flex flex-col items-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-3 py-3.5 text-center shadow-[var(--shadow-sm)] transition-all hover:border-[color:var(--color-accent-lila)]"
              >
                <Split className="h-5 w-5 text-[color:var(--color-accent-lila)]" />
                <span className="text-sm font-semibold text-[color:var(--color-text-main)]">Consumo real</span>
                <span className="text-[11px] text-[color:var(--color-text-muted)]">Cada quien lo suyo</span>
              </button>
              <button
                type="button"
                onClick={onOpenRescanConfirm}
                className="card-interactive flex flex-col items-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-3 py-3.5 text-center shadow-[var(--shadow-sm)] transition-all hover:border-[color:var(--color-accent-coral)]"
              >
                <RefreshCw className="h-5 w-5 text-[color:var(--color-accent-coral)]" />
                <span className="text-sm font-semibold text-[color:var(--color-text-main)]">Reescanear</span>
                <span className="text-[11px] text-[color:var(--color-text-muted)]">Subir otra foto</span>
              </button>
            </div>
            {items.length > 0 && (
              <p className="mt-2 text-xs text-[color:var(--color-text-muted)]">
                💡 Se detectaron items — elige "Consumo real" para asignar quién pidió qué.
              </p>
            )}
            {divisionMethod === 'consumption' && items.length === 0 && (
              <p className="mt-2 text-xs text-[color:var(--color-text-muted)]">
                No se detectaron items. Puedes agregarlos manualmente.
              </p>
            )}
          </div>

          {/* Rescan confirm */}
          {rescanConfirmOpen && (
            <div className="ds-alert ds-alert-danger flex-col !items-start gap-2">
              <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
                Vas a reemplazar la lectura actual
              </p>
              <p className="text-xs text-[color:var(--color-text-muted)]">
                {scanIsGuest
                  ? 'En modo local deberás volver a subir la factura.'
                  : 'Sube nuevamente la factura para generar una nueva lectura.'}
              </p>
              <div className="flex w-full items-center justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" size="sm" onClick={onCancelRescan}>
                  Cancelar
                </Button>
                <Button type="button" size="sm" onClick={onConfirmRescan}>
                  Reescanear ahora
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
