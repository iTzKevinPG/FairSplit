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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label="Item de consumo"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-transparent p-1 text-[color:var(--color-text-muted)] hover:border-[color:var(--color-border-subtle)] hover:text-[color:var(--color-text-main)]"
          aria-label="Cerrar item"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-primary-main)]">
              Item
            </p>
            <h2 className="text-2xl font-semibold text-[color:var(--color-text-main)]">
              {editingItemId ? 'Editar item' : 'Nuevo item'}
            </h2>
            <p className="text-sm text-[color:var(--color-text-muted)]">
              Define el item y quienes lo consumieron.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Nombre del item"
              value={itemName}
              onChange={(e) => onItemNameChange(e.target.value)}
              className="sm:col-span-2"
            />
            <div className="flex items-center">
              <div className="flex w-full items-center rounded-md border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-input)] focus-within:border-[color:var(--color-primary-main)] focus-within:ring-1 focus-within:ring-[color:var(--color-focus-ring)]">
                <span className="flex h-10 items-center rounded-l-md border border-[color:var(--color-border-subtle)] border-r-0 bg-[color:var(--color-surface-muted)] px-3 text-xs font-semibold text-[color:var(--color-text-muted)]">
                  {currency}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Precio unitario"
                  value={itemUnitPrice}
                  onChange={(e) => onItemUnitPriceChange(e.target.value)}
                  className="w-full appearance-none rounded-r-md border-0 bg-transparent px-3 text-sm text-[color:var(--color-text-main)] outline-none focus:outline-none focus-visible:ring-0"
                />
              </div>
            </div>
            <Input
              type="number"
              min="1"
              step="1"
              placeholder="Cantidad"
              value={itemQuantity}
              onChange={(e) => onItemQuantityChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wide text-[color:var(--color-text-muted)]">
              Participantes del item
            </p>
            <div className="flex flex-wrap gap-2">
              {effectiveParticipantIds.length === 0 ? (
                <span className="text-sm text-[color:var(--color-text-muted)]">
                  Agrega participantes para asignar consumos.
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

          {itemError ? <p className="text-sm text-red-600">{itemError}</p> : null}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              className="text-xs font-semibold text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-main)]"
              onClick={() => {
                onErrorChange(null)
                onClose()
              }}
            >
              Cancelar
            </button>
            <Button
              type="button"
              onClick={() => {
                const trimmedName = itemName.trim()
                const unitPrice = Number(itemUnitPrice)
                const quantity = Math.max(1, Math.floor(Number(itemQuantity)))

                if (!trimmedName) {
                  onErrorChange('El nombre del item es obligatorio.')
                  return
                }
                if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
                  onErrorChange('El precio unitario debe ser mayor que 0.')
                  return
                }
                if (!Number.isFinite(quantity) || quantity <= 0) {
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
                  unitPrice,
                  quantity,
                  participantIds: itemParticipantIds,
                })
              }}
            >
              {editingItemId ? 'Guardar item' : 'Agregar item'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
