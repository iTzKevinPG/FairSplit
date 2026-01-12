import {
  ChevronDown,
  ChevronUp,
  Edit2,
  Plus,
  Receipt,
  Save,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react'
import { Badge } from '../../shared/components/ui/badge'
import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useTour } from '@reactour/tour'
import { Button } from '../../shared/components/ui/button'
import { Input } from '../../shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../shared/components/ui/select'
import { MemberChip } from './MemberChip'
import { SectionCard } from './SectionCard'
import type { InvoiceItem } from '../../domain/invoice/Invoice'
import type { InvoiceForUI, PersonForUI } from '../../shared/state/fairsplitStore'
import { createId } from '../../shared/utils/createId'

interface InvoiceSectionProps {
  invoices: InvoiceForUI[]
  people: PersonForUI[]
  currency: string
  onAdd: (invoice: {
    description: string
    amount: number
    payerId: string
    participantIds: string[]
    divisionMethod?: 'equal' | 'consumption'
    consumptions?: Record<string, number>
    items?: InvoiceItem[]
    tipAmount?: number
    birthdayPersonId?: string
  }) => Promise<void>
  onUpdate: (invoice: {
    invoiceId: string
    description: string
    amount: number
    payerId: string
    participantIds: string[]
    divisionMethod?: 'equal' | 'consumption'
    consumptions?: Record<string, number>
    items?: InvoiceItem[]
    tipAmount?: number
    birthdayPersonId?: string
  }) => Promise<void>
  onRemove: (invoiceId: string) => Promise<void>
}

export function InvoiceSection({
  invoices,
  people,
  currency,
  onAdd,
  onUpdate,
  onRemove,
}: InvoiceSectionProps) {
  const { isOpen: isTourOpen, meta: tourMeta, steps, setCurrentStep } = useTour()
  const optionsMenuRef = useRef<HTMLDetailsElement | null>(null)
  const addMenuRef = useRef<HTMLDetailsElement | null>(null)
  const formRef = useRef<HTMLDivElement | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [payerId, setPayerId] = useState<string | undefined>(
    people[0]?.id ?? undefined,
  )
  const [participantIds, setParticipantIds] = useState<string[]>(
    people.map((person) => person.id),
  )
  const [error, setError] = useState<string | null>(null)
  const [detailInvoiceId, setDetailInvoiceId] = useState<string | null>(null)
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null)
  const [divisionMethod, setDivisionMethod] = useState<'equal' | 'consumption'>('equal')
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [itemModalOpen, setItemModalOpen] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [itemName, setItemName] = useState('')
  const [itemUnitPrice, setItemUnitPrice] = useState('')
  const [itemQuantity, setItemQuantity] = useState('1')
  const [itemParticipantIds, setItemParticipantIds] = useState<string[]>([])
  const [itemError, setItemError] = useState<string | null>(null)
  const [includeTip, setIncludeTip] = useState(false)
  const [tipAmount, setTipAmount] = useState('')
  const [birthdayEnabled, setBirthdayEnabled] = useState(false)
  const [birthdayPersonId, setBirthdayPersonId] = useState<string>('')
  const [showParticipants, setShowParticipants] = useState(false)
  const [showConsumption, setShowConsumption] = useState(false)

  const totalAmount = invoices.reduce((acc, inv) => acc + inv.amount, 0)
  const availablePersonIds = people.map((person) => person.id)
  const resolvedPayerId =
    payerId && availablePersonIds.includes(payerId) ? payerId : availablePersonIds[0]
  const sanitizedParticipantIds = participantIds.filter((id) =>
    availablePersonIds.includes(id),
  )
  const effectiveParticipantIds = showParticipants
    ? sanitizedParticipantIds
    : availablePersonIds
  const birthdayOptions = showParticipants ? sanitizedParticipantIds : availablePersonIds

  const handlePayerChange = (nextPayerId: string) => {
    setPayerId(nextPayerId)
    setParticipantIds((current) =>
      current.includes(nextPayerId) ? current : [...current, nextPayerId],
    )
  }

  const handleToggleParticipant = (id: string) => {
    if (id === resolvedPayerId) return
    setParticipantIds((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
      setBirthdayPersonId((currentBirthday) =>
        currentBirthday && next.includes(currentBirthday) ? currentBirthday : '',
      )
      return next
    })
  }

  const resetForm = () => {
    setDescription('')
    setAmount('')
    setPayerId(people[0]?.id ?? undefined)
    setParticipantIds(people.map((person) => person.id))
    setDivisionMethod('equal')
    setItems([])
    setExpandedItems({})
    setItemModalOpen(false)
    setEditingItemId(null)
    setItemName('')
    setItemUnitPrice('')
    setItemQuantity('1')
    setItemParticipantIds([])
    setItemError(null)
    setIncludeTip(false)
    setTipAmount('')
    setBirthdayEnabled(false)
    setBirthdayPersonId('')
    setShowParticipants(false)
    setShowConsumption(false)
    setEditingInvoiceId(null)
    setShowForm(false)
  }

  const startEdit = (invoice: InvoiceForUI) => {
    setShowForm(true)
    setEditingInvoiceId(invoice.id)
    setDescription(invoice.description)
    setAmount(String(invoice.amount))
    setPayerId(invoice.payerId)
    setParticipantIds(invoice.participantIds)
    const method =
      invoice.divisionMethod ?? (invoice.consumptions ? 'consumption' : 'equal')
    setDivisionMethod(method)
    setShowConsumption(method === 'consumption')
    setIncludeTip(Boolean(invoice.tipAmount && invoice.tipAmount > 0))
    setTipAmount(invoice.tipAmount ? String(invoice.tipAmount) : '')
    setBirthdayEnabled(Boolean(invoice.birthdayPersonId))
    setBirthdayPersonId(invoice.birthdayPersonId ?? '')
    setShowParticipants(true)
    setItems(invoice.items ?? [])
    setExpandedItems({})
    setItemModalOpen(false)
    setEditingItemId(null)
    setItemName('')
    setItemUnitPrice('')
    setItemQuantity('1')
    setItemParticipantIds([])
    setItemError(null)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmedDescription = description.trim()
    const numericAmount = Number(amount)
    const effectiveParticipants = effectiveParticipantIds
    const effectivePayerId = resolvedPayerId

    if (!trimmedDescription) {
      setError('La descripcion es obligatoria.')
      return
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('El monto debe ser mayor que 0.')
      return
    }
    if (!effectivePayerId) {
      setError('Debes seleccionar un pagador.')
      return
    }
    if (birthdayEnabled) {
      if (!birthdayPersonId) {
        setError('Selecciona a la persona invitada especial.')
        return
      }
      if (!effectiveParticipants.includes(birthdayPersonId)) {
        setError('El invitado especial debe estar en la lista de participantes.')
        return
      }
      if (effectiveParticipants.length < 2) {
        setError(
          'Se necesita al menos otra persona para repartir el consumo del invitado especial.',
        )
        return
      }
    }
    if (effectiveParticipants.length === 0) {
      setError('Selecciona al menos un participante.')
      return
    }
    const numericTip = Number(tipAmount || 0)
    if (includeTip && (!Number.isFinite(numericTip) || numericTip <= 0)) {
      setError('La propina debe ser mayor que 0.')
      return
    }

    let consumptionPayload: Record<string, number> | undefined
    let itemsPayload: InvoiceItem[] | undefined
    if (divisionMethod === 'consumption') {
      if (items.length === 0) {
        setError('Agrega al menos un item para repartir el consumo.')
        return
      }
      const normalizedItems = items.map((item) => ({
        ...item,
        participantIds: item.participantIds.filter((id) =>
          effectiveParticipants.includes(id),
        ),
      }))
      const invalidItem = normalizedItems.find(
        (item) => item.participantIds.length === 0,
      )
      if (invalidItem) {
        setError('Cada item debe tener al menos un participante asignado.')
        return
      }
      const totalRegistered = normalizedItems.reduce(
        (acc, item) => acc + getItemTotal(item),
        0,
      )
      if (totalRegistered <= 0) {
        setError('El total registrado debe ser mayor a 0.')
        return
      }
      const diff = Math.abs(numericAmount - totalRegistered)
      if (diff > 0.01) {
        setError('La suma de items no coincide con el total del gasto.')
        return
      }
      consumptionPayload = buildConsumptionsFromItems(
        normalizedItems,
        effectiveParticipants,
      )
      itemsPayload = normalizedItems
    }

    setError(null)
    if (editingInvoiceId) {
      await onUpdate({
        invoiceId: editingInvoiceId,
        description: trimmedDescription,
        amount: numericAmount,
        payerId: effectivePayerId,
        participantIds: effectiveParticipants,
        divisionMethod,
        consumptions: consumptionPayload,
        items: itemsPayload,
        tipAmount: includeTip ? numericTip : undefined,
        birthdayPersonId: birthdayEnabled ? birthdayPersonId : undefined,
      })
    } else {
      await onAdd({
        description: trimmedDescription,
        amount: numericAmount,
        payerId: effectivePayerId,
        participantIds: effectiveParticipants,
        divisionMethod,
        consumptions: consumptionPayload,
        items: itemsPayload,
        tipAmount: includeTip ? numericTip : undefined,
        birthdayPersonId: birthdayEnabled ? birthdayPersonId : undefined,
      })
    }
    if (typeof window !== 'undefined' && isTourOpen && tourMeta === 'guided') {
      window.dispatchEvent(new CustomEvent('tour:go-tab', { detail: { tabId: 'summary' } }))
      if (steps && setCurrentStep) {
        setCurrentStep((current) => Math.min(current + 1, steps.length - 1))
      }
    }
    resetForm()
  }

  const detailInvoice = invoices.find((invoice) => invoice.id === detailInvoiceId) ?? null
  const participantShares = detailInvoice ? calculateShares(detailInvoice, people) : []
  const consumptionSum = useMemo(() => {
    if (divisionMethod !== 'consumption') return 0
    return items.reduce((acc, item) => acc + getItemTotal(item), 0)
  }, [divisionMethod, items])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = optionsMenuRef.current
      if (!menu || !menu.hasAttribute('open')) return
      const target = event.target as Node
      if (!menu.contains(target)) {
        menu.removeAttribute('open')
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (!showForm) return
    const node = formRef.current
    if (!node) return
    const timeoutId = window.setTimeout(() => {
    }, 80)
    window.dispatchEvent(new CustomEvent('tour:invoice-form-open'))
    return () => window.clearTimeout(timeoutId)
  }, [showForm])

  const closeOptionsMenu = () => {
    optionsMenuRef.current?.removeAttribute('open')
  }

  const closeAddMenu = () => {
    addMenuRef.current?.removeAttribute('open')
  }

  const toggleConsumption = () => {
    setShowConsumption((current) => {
      const next = !current
      setDivisionMethod(next ? 'consumption' : 'equal')
      if (next) {
        setShowParticipants(true)
      }
      if (!next) {
        setItems([])
        setExpandedItems({})
        setItemModalOpen(false)
        setEditingItemId(null)
        setItemName('')
        setItemUnitPrice('')
        setItemQuantity('1')
        setItemParticipantIds([])
        setItemError(null)
        setError(null)
      }
      return next
    })
  }

  return (
    <>
      {itemModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
          <div
            className="relative w-full max-w-lg rounded-2xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-6 shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-label="Item de consumo"
          >
            <button
              type="button"
              onClick={() => {
                setItemModalOpen(false)
                setItemError(null)
              }}
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
                  onChange={(e) => setItemName(e.target.value)}
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
                      onChange={(e) => setItemUnitPrice(e.target.value)}
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
                  onChange={(e) => setItemQuantity(e.target.value)}
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
                            setItemParticipantIds((current) =>
                              current.includes(id)
                                ? current.filter((entry) => entry !== id)
                                : [...current, id],
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
                    setItemModalOpen(false)
                    setItemError(null)
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
                      setItemError('El nombre del item es obligatorio.')
                      return
                    }
                    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
                      setItemError('El precio unitario debe ser mayor que 0.')
                      return
                    }
                    if (!Number.isFinite(quantity) || quantity <= 0) {
                      setItemError('La cantidad debe ser mayor que 0.')
                      return
                    }
                    if (itemParticipantIds.length === 0) {
                      setItemError('Selecciona al menos un participante.')
                      return
                    }

                  const nextItem: InvoiceItem = {
                    id: editingItemId ?? createId(),
                    name: trimmedName,
                    unitPrice,
                    quantity,
                    participantIds: itemParticipantIds,
                  }

                    setItems((current) => {
                      if (editingItemId) {
                        return current.map((item) =>
                          item.id === editingItemId ? nextItem : item,
                        )
                      }
                      return [...current, nextItem]
                    })
                  setItemModalOpen(false)
                  setEditingItemId(null)
                  setItemName('')
                  setItemUnitPrice('')
                  setItemQuantity('1')
                  setItemParticipantIds([])
                  setItemError(null)
                }}
              >
                  {editingItemId ? 'Guardar item' : 'Agregar item'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <SectionCard
      title="Gastos"
      description="Registra cada gasto con su pagador y participantes. Elige reparto equitativo o por consumo real, con propina y invitado especial opcional."
      badge={`${invoices.length} gasto${invoices.length === 1 ? '' : 's'}`}
      action={
        invoices.length > 0 ? (
          <Badge variant="count">
            Total: {currency} {Math.round(totalAmount).toLocaleString('es-CO')}
          </Badge>
        ) : null
      }
    >
      <div className="space-y-5">
        <div className="rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)]/80 px-4 py-3 text-sm text-[color:var(--color-text-muted)]">
          Registra cada gasto con pagador, participantes y tipo de reparto. Puedes
          incluir propina o invitado especial.
        </div>

        <div className="flex items-center justify-end">
          {showForm ? (
            editingInvoiceId ? null : (
            <Button
              type="button"
              size="sm"
              onClick={() => setShowForm(false)}
              data-tour="invoice-add"
            >
              <X className="h-4 w-4" />
              Cerrar formulario
            </Button>
            )
          ) : (
            <details className="relative" ref={addMenuRef}>
              <summary
                className="flex cursor-pointer list-none items-center gap-2 rounded-md border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-3 py-2 text-sm font-semibold text-[color:var(--color-text-muted)] hover:border-[color:var(--color-primary-light)] hover:text-[color:var(--color-text-main)]"
                data-tour="invoice-add"
              >
                Agregar gasto
                <ChevronDown className="h-4 w-4" />
              </summary>
              <div className="absolute right-0 z-10 mt-2 w-56 rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-2 shadow-md">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(true)
                    closeAddMenu()
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-[color:var(--color-text-main)] hover:bg-[color:var(--color-surface-muted)]"
                >
                  <Plus className="h-4 w-4" />
                  Manual
                </button>
                <button
                  type="button"
                  disabled
                  className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-[color:var(--color-text-muted)] opacity-60"
                >
                  <Receipt className="h-4 w-4" />
                  Escanear factura (pronto)
                </button>
              </div>
            </details>
          )}
        </div>

        {showForm ? (
          <div
            className="animate-fade-in rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] p-4"
            data-tour="invoice-form"
            ref={formRef}
          >
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-4">
            <Input
              placeholder="Concepto del gasto"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="md:col-span-2"
              data-tour="invoice-description"
            />
            <div className="flex items-center md:col-span-2">
              <div className="flex w-full items-center rounded-md border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-input)] focus-within:border-[color:var(--color-primary-main)] focus-within:ring-1 focus-within:ring-[color:var(--color-focus-ring)]">
                <span className="flex h-10 items-center rounded-l-md border border-[color:var(--color-border-subtle)] border-r-0 bg-[color:var(--color-surface-muted)] px-3 text-xs font-semibold text-[color:var(--color-text-muted)]">
                  {currency}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Monto"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full appearance-none rounded-r-md border-0 bg-transparent px-3 text-sm text-[color:var(--color-text-main)] outline-none focus:outline-none focus-visible:ring-0"
                  data-tour="invoice-amount"
                />
              </div>
            </div>


            <Select
              value={resolvedPayerId || undefined}
              onValueChange={handlePayerChange}
              disabled={people.length === 0}
            >
              <SelectTrigger data-tour="invoice-payer">
                <SelectValue placeholder="Selecciona pagador" />
              </SelectTrigger>
              <SelectContent data-tour="invoice-payer-options" data-tour-select-content>
                {people.length === 0 ? (
                  <SelectItem value="__empty" disabled>
                    No hay personas
                  </SelectItem>
                ) : (
                  people.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      Pago: {person.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {(includeTip || birthdayEnabled || showParticipants || showConsumption) ? (
              <span className="hidden" data-tour="invoice-advanced" />
            ) : null}

            {includeTip ? (
              <div className="md:col-span-2 space-y-2">
                <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
                  Propina
                </p>
                <div className="flex items-center">
                  <div className="flex w-full items-center rounded-md border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-input)] focus-within:border-[color:var(--color-primary-main)] focus-within:ring-1 focus-within:ring-[color:var(--color-focus-ring)]">
                    <span className="flex h-10 items-center rounded-l-md border border-[color:var(--color-border-subtle)] border-r-0 bg-[color:var(--color-surface-muted)] px-3 text-xs font-semibold text-[color:var(--color-text-muted)]">
                      {currency}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Monto de la propina"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(e.target.value)}
                      className="w-full appearance-none rounded-r-md border-0 bg-transparent px-3 text-sm text-[color:var(--color-text-main)] outline-none focus:outline-none focus-visible:ring-0"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {birthdayEnabled ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
                  Invitado especial
                </p>
                <Select
                  value={birthdayPersonId || undefined}
                  onValueChange={setBirthdayPersonId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona invitado especial" />
                  </SelectTrigger>
                  <SelectContent data-tour-select-content>
                    {birthdayOptions.map((id) => (
                      <SelectItem key={id} value={id}>
                        {resolvePersonName(id, people)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {showParticipants ? (
              <div className="md:col-span-4 space-y-2" data-tour="invoice-participants">
                <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
                  Personas incluidas
                </p>
                <div className="flex flex-wrap gap-2">
                  {people.length === 0 ? (
                    <span className="text-sm text-[color:var(--color-text-muted)]">
                      Agrega personas para asignar participantes.
                    </span>
                  ) : (
                    people.map((person) => {
                      const checked = sanitizedParticipantIds.includes(person.id)
                      const isPayer = person.id === resolvedPayerId
                      return (
                        <MemberChip
                          key={person.id}
                          name={person.name}
                          isPayer={isPayer}
                          isSelected={checked}
                          isEditable
                          onToggle={
                            isPayer ? undefined : () => handleToggleParticipant(person.id)
                          }
                        />
                      )
                    })
                  )}
                </div>
              </div>
            ) : null}

            {showConsumption ? (
              <div className="md:col-span-4 space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-[color:var(--color-text-main)]">
                    Items del consumo
                  </p>
                  <p className="text-[11px] font-semibold text-[color:var(--color-text-muted)] sm:text-right">
                    Total registrado:{' '}
                    <span className="text-[color:var(--color-primary-main)]">
                      {currency} {roundToCents(consumptionSum).toFixed(2)}
                    </span>
                  </p>
                </div>

                {items.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-4 text-sm text-[color:var(--color-text-muted)]">
                    Aun no hay items. Usa &quot;Agregar item&quot; para empezar.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => {
                      const isExpanded = Boolean(expandedItems[item.id])
                      const itemTotal = getItemTotal(item)
                      const shares = buildItemShares(item)
                      return (
                        <div
                          key={item.id}
                          className="card-interactive overflow-hidden rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)]"
                        >
                          <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-1">
                              <p className="font-semibold text-[color:var(--color-text-main)]">
                                {item.name}
                              </p>
                              <p className="text-xs text-[color:var(--color-text-muted)]">
                                Cantidad: {item.quantity} - Unitario: {currency}{' '}
                                {item.unitPrice.toFixed(2)}
                              </p>
                              <p className="text-[10px] uppercase tracking-wide text-[color:var(--color-text-muted)]">
                                Participantes: {item.participantIds.length}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="ds-badge-soft">
                                {currency} {itemTotal.toFixed(2)}
                              </span>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 text-[color:var(--color-primary-main)] hover:underline"
                                onClick={() =>
                                  setExpandedItems((current) => ({
                                    ...current,
                                    [item.id]: !current[item.id],
                                  }))
                                }
                              >
                                {isExpanded ? 'Ocultar detalle' : 'Ver detalle'}
                                {isExpanded ? (
                                  <ChevronUp className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-main)]"
                                onClick={() => {
                                  const nextParticipants = item.participantIds.filter((id) =>
                                    effectiveParticipantIds.includes(id),
                                  )
                                  setEditingItemId(item.id)
                                  setItemName(item.name)
                                  setItemUnitPrice(String(item.unitPrice))
                                  setItemQuantity(String(item.quantity))
                                  setItemParticipantIds(nextParticipants)
                                  setItemError(null)
                                  setItemModalOpen(true)
                                }}
                                aria-label="Editar item"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="text-[color:var(--color-accent-danger)] hover:text-[color:var(--color-accent-danger)]/80"
                                onClick={() =>
                                  setItems((current) =>
                                    current.filter((entry) => entry.id !== item.id),
                                  )
                                }
                                aria-label="Eliminar item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {isExpanded ? (
                            <div className="animate-fade-in border-t border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] p-4 text-sm text-[color:var(--color-text-main)]">
                              {shares.length === 0 ? (
                                <p className="text-sm text-[color:var(--color-text-muted)]">
                                  Sin participantes asignados.
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {shares.map((share) => (
                                    <div
                                      key={`${item.id}-${share.personId}`}
                                      className="flex items-center justify-between rounded-md border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-3 py-2"
                                    >
                                      <span className="font-semibold text-[color:var(--color-text-main)]">
                                        {resolvePersonName(share.personId, people)}
                                      </span>
                                      <span className="font-semibold text-[color:var(--color-primary-main)]">
                                        {currency} {share.amount.toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setEditingItemId(null)
                    setItemName('')
                    setItemUnitPrice('')
                    setItemQuantity('1')
                    setItemParticipantIds([])
                    setItemError(null)
                    setItemModalOpen(true)
                  }}
                  className="flex w-full items-center justify-between rounded-lg border border-dashed border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-4 py-3 text-sm font-semibold text-[color:var(--color-text-muted)] transition hover:border-[color:var(--color-primary-light)] hover:text-[color:var(--color-text-main)]"
                >
                  <span>Agregar item</span>
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ) : null}

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="md:col-span-4 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
              <details className="relative w-full sm:w-auto" ref={optionsMenuRef}>
                <summary
                  className="flex w-full cursor-pointer list-none items-center justify-center gap-2 rounded-md border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-3 py-2 text-xs font-semibold text-[color:var(--color-text-muted)] hover:border-[color:var(--color-primary-light)] hover:text-[color:var(--color-text-main)] sm:ml-auto sm:w-32 sm:inline-flex"
                  data-tour="invoice-advanced-toggle"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Opciones
                </summary>
                <div className="absolute left-0 right-0 z-10 mt-2 w-full rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-2 shadow-md sm:left-auto sm:right-0 sm:w-52">
                  <button
                    type="button"
                    onClick={() =>
                      setIncludeTip((current) => {
                        const next = !current
                        if (!next) setTipAmount('')
                        setError(null)
                        closeOptionsMenu()
                        return next
                      })
                    }
                    className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-xs font-semibold ${
                      includeTip
                        ? 'bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-main)]'
                        : 'text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-muted)]'
                    }`}
                  >
                    Propina
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setBirthdayEnabled((current) => {
                        const next = !current
                        if (!next) setBirthdayPersonId('')
                        setError(null)
                        closeOptionsMenu()
                        return next
                      })
                    }
                    className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-xs font-semibold ${
                      birthdayEnabled
                        ? 'bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-main)]'
                        : 'text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-muted)]'
                    }`}
                  >
                    Invitado especial
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowParticipants((current) => {
                        const next = !current
                        if (!next) setError(null)
                        return next
                      })
                      closeOptionsMenu()
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-xs font-semibold ${
                      showParticipants
                        ? 'bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-main)]'
                        : 'text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-muted)]'
                    }`}
                  >
                    Participantes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toggleConsumption()
                      closeOptionsMenu()
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-xs font-semibold ${
                      showConsumption
                        ? 'bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-main)]'
                        : 'text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-muted)]'
                    }`}
                  >
                    Consumo
                  </button>
                </div>
              </details>
              {editingInvoiceId ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-[color:var(--color-primary-main)] hover:text-[color:var(--color-primary-dark)]"
                  onClick={resetForm}
                >
                  Cancelar edicion
                </button>
              ) : null}
              <Button
                type="submit"
                disabled={people.length === 0}
                data-tour="invoice-save"
                className="w-full sm:w-44"
              >
                <Save className="h-4 w-4" />
                {editingInvoiceId ? 'Guardar cambios' : 'Guardar gasto'}
              </Button>
            </div>
          </form>
        </div>
        ) : null}

        {editingInvoiceId ? (
          <div className="flex items-center justify-between text-xs text-[color:var(--color-text-muted)]">
            <span>Editando gasto seleccionado.</span>
          </div>
        ) : null}

        <div className="space-y-3">
          {invoices.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-6 text-center">
              <p className="text-sm text-[color:var(--color-text-muted)]">
                Aun no has registrado gastos. Usa "Agregar gasto" para crear el primero.
              </p>
            </div>
          ) : (
            invoices.map((invoice) => {
              const isExpanded = detailInvoiceId === invoice.id
              const shares = isExpanded && detailInvoice ? participantShares : []

              return (
                <div
                  key={invoice.id}
                  className="card-interactive overflow-hidden rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)]"
                >
                  <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[color:var(--color-text-main)]">
                          {invoice.description}
                        </p>
                        <span className="ds-badge-soft">
                          {currency} {invoice.amount.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-[color:var(--color-text-muted)]">
                        Pago: {resolvePersonName(invoice.payerId, people)}
                      </p>
                      <p className="text-xs text-[color:var(--color-text-muted)]">
                        Personas ({invoice.participantIds.length}):{' '}
                        {invoice.participantIds
                          .map((id) => resolvePersonName(id, people))
                          .join(', ')}
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-[color:var(--color-text-muted)]">
                        Reparto:{' '}
                        {invoice.divisionMethod === 'consumption' ? 'Consumo real' : 'Equitativo'}
                      </p>
                      {invoice.divisionMethod === 'consumption' && invoice.items?.length ? (
                        <p className="text-xs text-[color:var(--color-text-muted)]">
                          Items:{' '}
                          {invoice.items.slice(0, 2).map((item) => item.name).join(', ')}
                          {invoice.items.length > 2
                            ? ` · +${invoice.items.length - 2} más`
                            : ''}
                        </p>
                      ) : null}
                      {invoice.tipAmount ? (
                        <p className="text-xs text-[color:var(--color-text-muted)]">
                          Propina: {currency} {invoice.tipAmount.toFixed(2)}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-[color:var(--color-primary-main)] hover:underline"
                        onClick={() =>
                          setDetailInvoiceId((current) => (current === invoice.id ? null : invoice.id))
                        }
                      >
                        {isExpanded ? 'Ocultar detalle' : 'Ver detalle'}
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-main)]"
                        onClick={() => startEdit(invoice)}
                        aria-label="Editar gasto"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="text-[color:var(--color-accent-danger)] hover:text-[color:var(--color-accent-danger)]/80"
                        onClick={() => onRemove(invoice.id)}
                        aria-label="Eliminar gasto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && detailInvoice ? (
                    <div className="animate-fade-in border-t border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] p-4 text-sm text-[color:var(--color-text-main)]">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-[color:var(--color-text-main)]">
                            {detailInvoice.description}
                          </p>
                          <p className="text-xs text-[color:var(--color-text-muted)]">
                            Pago: {resolvePersonName(detailInvoice.payerId, people)} - Monto:{' '}
                            {currency} {detailInvoice.amount.toFixed(2)}
                            {detailInvoice.tipAmount
                              ? ` - Propina: ${currency} ${detailInvoice.tipAmount.toFixed(2)}`
                              : ''}
                          </p>
                          <p className="text-[10px] uppercase tracking-wide text-[color:var(--color-text-muted)]">
                            Reparto:{' '}
                            {detailInvoice.divisionMethod === 'consumption'
                              ? 'Consumo real'
                              : 'Equitativo'}
                          </p>
                          {detailInvoice.birthdayPersonId ? (
                            <p className="text-[11px] font-semibold text-[color:var(--color-primary-main)]">
                              Invitado especial:{' '}
                              {resolvePersonName(detailInvoice.birthdayPersonId, people)}
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="text-xs font-semibold text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-main)]"
                          onClick={() => setDetailInvoiceId(null)}
                        >
                          Cerrar
                        </button>
                      </div>
                      {detailInvoice.divisionMethod === 'consumption' &&
                      detailInvoice.items?.length ? (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-semibold text-[color:var(--color-text-main)]">
                            Items del consumo
                          </p>
                          <div className="space-y-2">
                            {detailInvoice.items.map((item) => {
                              const participants = item.participantIds
                                .map((id) => resolvePersonName(id, people))
                                .join(', ')
                              return (
                                <div
                                  key={item.id}
                                  className="rounded-md border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-3 py-2"
                                >
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold text-[color:var(--color-text-main)]">
                                      {item.name}
                                    </span>
                                    <span className="text-[color:var(--color-primary-main)] font-semibold">
                                      {currency} {getItemTotal(item).toFixed(2)}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[color:var(--color-text-muted)]">
                                    Cantidad: {item.quantity} · Unitario: {currency}{' '}
                                    {item.unitPrice.toFixed(2)}
                                  </p>
                                  <p className="text-[11px] text-[color:var(--color-text-muted)]">
                                    Participantes:{' '}
                                    {participants.length > 0 ? participants : 'Sin participantes'}
                                  </p>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ) : null}
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-semibold text-[color:var(--color-text-main)]">
                          Consumo por persona
                        </p>
                        {shares.map((share) => (
                          <div
                            key={share.personId}
                            className={`flex items-center justify-between rounded-md border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-3 py-2 ${
                              share.isBirthday
                                ? 'border-[color:var(--color-primary-light)]'
                                : ''
                            }`}
                          >
                            <span className="font-semibold text-[color:var(--color-text-main)]">
                              {resolvePersonName(share.personId, people)}
                              {share.isBirthday ? (
                                <span className="ml-2 rounded-full accent-chip px-2 py-0.5 text-[10px] font-semibold text-accent">
                                  Invitado especial
                                </span>
                              ) : null}
                            </span>
                            <div className="text-right">
                              {share.tipPortion ? (
                                <p className="text-[11px] text-[color:var(--color-text-muted)]">
                                  Propina: {currency} {share.tipPortion.toFixed(2)}
                                </p>
                              ) : null}
                              <p className="text-[color:var(--color-primary-main)] font-semibold">
                                Total: {currency} {share.amount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })
          )}
        </div>
      </div>
      </SectionCard>
    </>
  )
}

function resolvePersonName(id: string, people: PersonForUI[]) {
  return people.find((person) => person.id === id)?.name ?? 'Desconocido'
}

function getItemTotal(item: InvoiceItem) {
  return roundToCents(item.unitPrice * item.quantity)
}

function buildItemShares(item: InvoiceItem) {
  const participants = item.participantIds
  if (participants.length === 0) return []
  const total = getItemTotal(item)
  const rawShare = total / participants.length
  const share = roundToCents(rawShare)
  const totalRounded = roundToCents(share * participants.length)
  const diff = roundToCents(total - totalRounded)
  return participants.map((personId, index) => ({
    personId,
    amount: roundToCents(share + (index === participants.length - 1 ? diff : 0)),
  }))
}

function buildConsumptionsFromItems(items: InvoiceItem[], participantIds: string[]) {
  const base = participantIds.reduce<Record<string, number>>((acc, id) => {
    acc[id] = 0
    return acc
  }, {})
  return items.reduce<Record<string, number>>((acc, item) => {
    buildItemShares(item).forEach((share) => {
      acc[share.personId] = roundToCents((acc[share.personId] ?? 0) + share.amount)
    })
    return acc
  }, base)
}

function calculateShares(invoice: InvoiceForUI, people: PersonForUI[]) {
  const participantIds = invoice.participantIds
  if (participantIds.length === 0) return []
  const tip = roundToCents(invoice.tipAmount ?? 0)
  const tipReceivers = invoice.birthdayPersonId
    ? participantIds.filter((id) => id !== invoice.birthdayPersonId)
    : participantIds
  const tipShare =
    tipReceivers.length > 0 ? roundToCents(tip / tipReceivers.length) : 0
  const tipTotalRounded = roundToCents(tipShare * tipReceivers.length)
  const tipDiff = roundToCents(tip - tipTotalRounded)
  const birthdayPersonId = invoice.birthdayPersonId

  if (invoice.divisionMethod === 'consumption') {
    const consumptions = invoice.consumptions ?? {}
    const rounded = participantIds.map((id) =>
      roundToCents(Number(consumptions[id] ?? 0)),
    )
    const totalRounded = roundToCents(rounded.reduce((acc, val) => acc + val, 0))
    const diff = roundToCents(invoice.amount - totalRounded)
    const adjustedBases = rounded.map((base, index) =>
      roundToCents(base + (index === participantIds.length - 1 ? diff : 0)),
    )
    const withBirthday = redistributeBirthdayShares(
      adjustedBases,
      participantIds,
      birthdayPersonId,
    )

    return participantIds.map((personId, index) => {
      const adjustedBase = withBirthday[index] ?? 0
      const adjustedTip = buildTipPortion(
        personId,
        tipReceivers,
        tipShare,
        tipDiff,
      )
      return {
        personId,
        amount: roundToCents(adjustedBase + adjustedTip),
        tipPortion: adjustedTip,
        name: resolvePersonName(personId, people),
        isBirthday: personId === birthdayPersonId,
      }
    })
  }

  const count = participantIds.length
  const rawShare = invoice.amount / count
  const share = roundToCents(rawShare)
  const totalRounded = roundToCents(share * count)
  const diff = roundToCents(invoice.amount - totalRounded)
  const adjustedBases = participantIds.map((_, index) =>
    index === participantIds.length - 1 ? roundToCents(share + diff) : share,
  )
  const withBirthday = redistributeBirthdayShares(
    adjustedBases,
    participantIds,
    birthdayPersonId,
  )

  return participantIds.map((personId, index) => {
    const adjusted = withBirthday[index] ?? 0
    const adjustedTip = buildTipPortion(personId, tipReceivers, tipShare, tipDiff)
    return {
      personId,
      amount: roundToCents(adjusted + adjustedTip),
      tipPortion: adjustedTip,
      name: resolvePersonName(personId, people),
      isBirthday: personId === birthdayPersonId,
    }
  })
}

const roundToCents = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100

function redistributeBirthdayShares(
  baseShares: number[],
  participants: string[],
  birthdayPersonId?: string,
) {
  if (!birthdayPersonId) return baseShares
  const birthdayIndex = participants.findIndex((id) => id === birthdayPersonId)
  if (birthdayIndex === -1 || participants.length <= 1) return baseShares

  const updated = [...baseShares]
  const birthdayBase = updated[birthdayIndex] ?? 0
  updated[birthdayIndex] = 0

  const others = participants.filter((id) => id !== birthdayPersonId)
  const perOther = roundToCents(birthdayBase / others.length)
  const totalRounded = roundToCents(perOther * others.length)
  const diff = roundToCents(birthdayBase - totalRounded)

  others.forEach((id, idx) => {
    const target = participants.indexOf(id)
    updated[target] = roundToCents(
      (updated[target] ?? 0) + perOther + (idx === others.length - 1 ? diff : 0),
    )
  })

  return updated
}

function buildTipPortion(
  personId: string,
  tipReceivers: string[],
  tipShare: number,
  tipDiff: number,
) {
  if (!tipReceivers.includes(personId)) return 0
  const isLastTip =
    tipReceivers.length > 0 &&
    personId === tipReceivers[tipReceivers.length - 1]
  return roundToCents(tipShare + (isLastTip ? tipDiff : 0))
}
