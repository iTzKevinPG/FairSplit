import { X } from 'lucide-react'
import { Button } from '../../../shared/components/ui/button'
import { Input } from '../../../shared/components/ui/input'
import { MemberChip } from '../MemberChip'
import type { InvoiceItem } from '../../../domain/invoice/Invoice'
import type { PersonForUI } from '../../../shared/state/fairsplitStore'
import { createId } from '../../../shared/utils/createId'

interface InvoiceItemModalProps {
  open: boolean
  currency: string
  people: PersonForUI[]
  resolvedPayerId?: string
  effectiveParticipantIds: string[]
  editingItemId: string | null
  itemName: string
  itemUnitPrice: string
  itemQuantity: string
  itemParticipantIds: string[]
  itemError: string | null
  onItemNameChange: (value: string) => void
  onItemUnitPriceChange: (value: string) => void
  onItemQuantityChange: (value: string) => void
  onItemParticipantIdsChange: (value: string[]) => void
  onErrorChange: (value: string | null) => void
  onClose: () => void
  onSave: (nextItem: InvoiceItem) => void
}

export function InvoiceItemModal({
  open,
  currency,
  people,
  resolvedPayerId,
  effectiveParticipantIds,
  editingItemId,
  itemName,
  itemUnitPrice,
  itemQuantity,
  itemParticipantIds,
  itemError,
  onItemNameChange,
  onItemUnitPriceChange,
  onItemQuantityChange,
  onItemParticipantIdsChange,
  onErrorChange,
  onClose,
  onSave,
}: InvoiceItemModalProps) {
  if (!open) return null

  const unitPrice = Number(itemUnitPrice) || 0
  const quantity = Number(itemQuantity) || 0
  const subtotal = unitPrice * quantity

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
      <div
        className="animate-fade-in relative w-full max-w-lg rounded-t-3xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-5 shadow-[var(--shadow-lg)] sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Item de consumo"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-primary-main)]">
              Item
            </p>
            <h2 className="text-lg font-semibold text-[color:var(--color-text-main)]">
              {editingItemId ? 'Editar item' : 'Nuevo item'}
            </h2>
          </div>
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-main)]"
            aria-label="Cerrar item"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="¿Qué pidieron?"
            value={itemName}
            onChange={(e) => onItemNameChange(e.target.value)}
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[color:var(--color-text-muted)]">
                Precio unitario
              </label>
              <div className="flex items-center rounded-[var(--radius-md)] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-input)] focus-within:border-[color:var(--color-primary-main)] focus-within:ring-1 focus-within:ring-[color:var(--color-focus-ring)]">
                <span className="flex h-10 items-center border-r border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] px-2.5 text-[11px] font-semibold text-[color:var(--color-text-muted)]">
                  {currency}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={itemUnitPrice}
                  onChange={(e) => onItemUnitPriceChange(e.target.value)}
                  className="w-full appearance-none bg-transparent px-3 py-2 text-sm text-[color:var(--color-text-main)] outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[color:var(--color-text-muted)]">
                Cantidad
              </label>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="1"
                value={itemQuantity}
                onChange={(e) => onItemQuantityChange(e.target.value)}
              />
            </div>
          </div>

          {subtotal > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-[color:var(--color-primary-soft)] px-4 py-2.5">
              <span className="text-xs font-medium text-[color:var(--color-text-muted)]">Subtotal</span>
              <span className="text-sm font-bold text-[color:var(--color-primary-main)]">
                {currency} {subtotal.toFixed(2)}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-[color:var(--color-text-muted)]">
              ¿Quiénes lo pidieron?
            </p>
            <div className="flex flex-wrap gap-2">
              {effectiveParticipantIds.length === 0 ? (
                <span className="text-xs text-[color:var(--color-text-muted)]">
                  Agrega personas al evento primero.
                </span>
              ) : (
                effectiveParticipantIds.map((id) => {
                  const person = people.find((entry) => entry.id === id)
                  if (!person) return null
                  const checked = itemParticipantIds.includes(id)
                  const isPayer = id === resolvedPayerId
                  return (
                    <MemberChip
                      key={id}
                      name={person.name}
                      isPayer={isPayer}
                      isSelected={checked}
                      isEditable
                      onToggle={() =>
                        onItemParticipantIdsChange(
                          checked
                            ? itemParticipantIds.filter((entry) => entry !== id)
                            : [...itemParticipantIds, id],
                        )
                      }
                    />
                  )
                })
              )}
            </div>
          </div>

          {itemError ? (
            <p className="text-xs font-medium text-[color:var(--color-accent-danger)]">{itemError}</p>
          ) : null}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onErrorChange(null)
                onClose()
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                const trimmedName = itemName.trim()
                const parsedUnitPrice = Number(itemUnitPrice)
                const parsedQuantity = Math.max(1, Math.floor(Number(itemQuantity)))

                if (!trimmedName) {
                  onErrorChange('El nombre del item es obligatorio.')
                  return
                }
                if (!Number.isFinite(parsedUnitPrice) || parsedUnitPrice <= 0) {
                  onErrorChange('El precio unitario debe ser mayor que 0.')
                  return
                }
                if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
                  onErrorChange('La cantidad debe ser mayor que 0.')
                  return
                }
                if (itemParticipantIds.length === 0) {
                  onErrorChange('Selecciona al menos un participante.')
                  return
                }

                onSave({
                  id: editingItemId ?? createId(),
                  name: trimmedName,
                  unitPrice: parsedUnitPrice,
                  quantity: parsedQuantity,
                  participantIds: itemParticipantIds,
                })
              }}
            >
              {editingItemId ? 'Guardar' : 'Agregar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
