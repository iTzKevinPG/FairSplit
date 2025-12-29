import { ChevronDown, ChevronUp, Edit2, Plus, Trash2 } from 'lucide-react'
import { Badge } from '../../shared/components/ui/badge'
import { type FormEvent, useMemo, useState } from 'react'
import { Button } from '../../shared/components/ui/button'
import { Checkbox } from '../../shared/components/ui/checkbox'
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
import type { InvoiceForUI, PersonForUI } from '../../shared/state/fairsplitStore'

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
  const [consumptions, setConsumptions] = useState<Record<string, string>>(
    () =>
      people.reduce<Record<string, string>>((acc, person) => {
        acc[person.id] = ''
        return acc
      }, {}),
  )
  const [includeTip, setIncludeTip] = useState(false)
  const [tipAmount, setTipAmount] = useState('')
  const [birthdayEnabled, setBirthdayEnabled] = useState(false)
  const [birthdayPersonId, setBirthdayPersonId] = useState<string>('')

  const totalAmount = invoices.reduce((acc, inv) => acc + inv.amount, 0)

  const handleToggleParticipant = (id: string) => {
    if (id === payerId) return
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
    setConsumptions(
      people.reduce<Record<string, string>>((acc, person) => {
        acc[person.id] = ''
        return acc
      }, {}),
    )
    setDivisionMethod('equal')
    setIncludeTip(false)
    setTipAmount('')
    setBirthdayEnabled(false)
    setBirthdayPersonId('')
    setEditingInvoiceId(null)
  }

  const startEdit = (invoice: InvoiceForUI) => {
    setEditingInvoiceId(invoice.id)
    setDescription(invoice.description)
    setAmount(String(invoice.amount))
    setPayerId(invoice.payerId)
    setParticipantIds(invoice.participantIds)
    const method =
      invoice.divisionMethod ?? (invoice.consumptions ? 'consumption' : 'equal')
    setDivisionMethod(method)
    setIncludeTip(Boolean(invoice.tipAmount && invoice.tipAmount > 0))
    setTipAmount(invoice.tipAmount ? String(invoice.tipAmount) : '')
    setBirthdayEnabled(Boolean(invoice.birthdayPersonId))
    setBirthdayPersonId(invoice.birthdayPersonId ?? '')
    setConsumptions(
      people.reduce<Record<string, string>>((acc, person) => {
        const value = invoice.consumptions?.[person.id]
        acc[person.id] = value !== undefined ? String(value) : ''
        return acc
      }, {}),
    )
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmedDescription = description.trim()
    const numericAmount = Number(amount)

    if (!trimmedDescription) {
      setError('La descripcion es obligatoria.')
      return
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('El monto debe ser mayor que 0.')
      return
    }
    if (!payerId) {
      setError('Debes seleccionar un pagador.')
      return
    }
    if (birthdayEnabled) {
      if (!birthdayPersonId) {
        setError('Selecciona a la persona cumpleanera.')
        return
      }
      if (!participantIds.includes(birthdayPersonId)) {
        setError('El cumpleanero debe estar en la lista de participantes.')
        return
      }
      if (participantIds.length < 2) {
        setError(
          'Se necesita al menos otra persona para repartir el consumo del cumpleanero.',
        )
        return
      }
    }
    if (participantIds.length === 0) {
      setError('Selecciona al menos un participante.')
      return
    }
    const numericTip = Number(tipAmount || 0)
    if (includeTip && (!Number.isFinite(numericTip) || numericTip <= 0)) {
      setError('La propina debe ser mayor que 0.')
      return
    }

    let consumptionPayload: Record<string, number> | undefined
    if (divisionMethod === 'consumption') {
      const numericConsumptions = participantIds.reduce<Record<string, number>>(
        (acc, id) => {
          const value = Number(consumptions[id] ?? 0)
          acc[id] = value
          return acc
        },
        {},
      )
      const sum = Object.values(numericConsumptions).reduce((acc, val) => acc + val, 0)
      const hasPositive = Object.values(numericConsumptions).some((val) => val > 0)
      if (!hasPositive || sum <= 0) {
        setError('Ingresa consumos mayores a 0.')
        return
      }
      const diff = Math.abs(numericAmount - sum)
      if (diff > 0.01) {
        setError('La suma de consumos no coincide con el total.')
        return
      }
      if (birthdayEnabled && birthdayPersonId && consumptions[birthdayPersonId] === undefined) {
        setError('El cumpleanero debe tener un consumo declarado (puede ser 0).')
        return
      }
      consumptionPayload = numericConsumptions
    }

    setError(null)
    if (editingInvoiceId) {
      await onUpdate({
        invoiceId: editingInvoiceId,
        description: trimmedDescription,
        amount: numericAmount,
        payerId,
        participantIds,
        divisionMethod,
        consumptions: consumptionPayload,
        tipAmount: includeTip ? numericTip : undefined,
        birthdayPersonId: birthdayEnabled ? birthdayPersonId : undefined,
      })
    } else {
      await onAdd({
        description: trimmedDescription,
        amount: numericAmount,
        payerId,
        participantIds,
        divisionMethod,
        consumptions: consumptionPayload,
        tipAmount: includeTip ? numericTip : undefined,
        birthdayPersonId: birthdayEnabled ? birthdayPersonId : undefined,
      })
    }
    resetForm()
  }

  const detailInvoice = invoices.find((invoice) => invoice.id === detailInvoiceId) ?? null
  const participantShares = detailInvoice ? calculateShares(detailInvoice, people) : []
  const consumptionSum = useMemo(() => {
    if (divisionMethod !== 'consumption') return 0
    return participantIds.reduce((acc, id) => acc + Number(consumptions[id] ?? 0), 0)
  }, [divisionMethod, participantIds, consumptions])

  return (
    <SectionCard
      title="Gastos"
      description="Registra cada gasto con su pagador y participantes. Elige reparto equitativo o por consumo real, con propina y cumpleanero opcional."
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
        <div className="rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] p-4">
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-4">
            <Input
              placeholder="Concepto del gasto"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="md:col-span-2"
            />
            <div className="flex items-center md:col-span-2">
              <div className="flex h-10 items-center rounded-l-md border border-[color:var(--color-border-subtle)] border-r-0 bg-[color:var(--color-surface-muted)] px-3 text-xs font-semibold text-[color:var(--color-text-muted)]">
                {currency}
              </div>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Monto"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 rounded-l-none border-l-0 shadow-none"
              />
            </div>

            <div className="md:col-span-4 flex flex-wrap items-center gap-4 text-sm text-[color:var(--color-text-muted)]">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={includeTip}
                  onCheckedChange={(value) => setIncludeTip(Boolean(value))}
                  id="include-tip"
                  disabled={people.length === 0}
                />
                <span>
                  Agregar propina{' '}
                  <span className="text-xs text-[color:var(--color-text-muted)]">
                    (se distribuye entre participantes)
                  </span>
                </span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={birthdayEnabled}
                  onCheckedChange={(value) => setBirthdayEnabled(Boolean(value))}
                  id="birthday-toggle"
                  disabled={participantIds.length === 0}
                />
                <span>
                  Cumpleanero{' '}
                  <span className="text-xs text-[color:var(--color-text-muted)]">
                    (redistribuir su consumo)
                  </span>
                </span>
              </label>
            </div>

            <div className="md:col-span-4 grid gap-3 sm:grid-cols-2">
              {includeTip ? (
                <div className="flex items-center">
                  <div className="flex h-10 items-center rounded-l-md border border-[color:var(--color-border-subtle)] border-r-0 bg-[color:var(--color-surface-muted)] px-3 text-xs font-semibold text-[color:var(--color-text-muted)] shadow-[var(--shadow-sm)]">
                    {currency}
                  </div>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Propina"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    className="w-full rounded-l-none border-l-0 shadow-none"
                  />
                </div>
              ) : (
                <div className="hidden sm:block" aria-hidden="true" />
              )}

              {birthdayEnabled ? (
                <Select
                  value={birthdayPersonId || undefined}
                  onValueChange={setBirthdayPersonId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona cumpleanero" />
                  </SelectTrigger>
                  <SelectContent>
                    {participantIds.map((id) => (
                      <SelectItem key={id} value={id}>
                        {resolvePersonName(id, people)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="hidden sm:block" aria-hidden="true" />
              )}
            </div>

            <Select
              value={payerId || undefined}
              onValueChange={setPayerId}
              disabled={people.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona pagador" />
              </SelectTrigger>
              <SelectContent>
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

            <Select
              value={divisionMethod}
              onValueChange={(value) => setDivisionMethod(value as 'equal' | 'consumption')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equal">Reparto equitativo</SelectItem>
                <SelectItem value="consumption">Por consumo real</SelectItem>
              </SelectContent>
            </Select>

            <div className="md:col-span-4 space-y-2">
              <p className="text-xs font-semibold tracking-wide text-[color:var(--color-text-muted)]">
                Personas incluidas
              </p>
              <div className="flex flex-wrap gap-2">
                {people.length === 0 ? (
                  <span className="text-sm text-[color:var(--color-text-muted)]">
                    Agrega personas para asignar participantes.
                  </span>
                ) : (
                  people.map((person) => {
                    const checked = participantIds.includes(person.id)
                    const isPayer = person.id === payerId
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

            {divisionMethod === 'consumption' ? (
              <div className="md:col-span-4 space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-semibold tracking-wide text-[color:var(--color-text-muted)]">
                    Consumo por persona
                  </p>
                  <p className="text-[11px] font-semibold text-[color:var(--color-text-muted)] sm:text-right">
                    Total registrado:{' '}
                    <span className="text-[color:var(--color-primary-main)]">
                      {currency} {roundToCents(consumptionSum).toFixed(2)}
                    </span>
                  </p>
                </div>
                {participantIds.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-4 text-center">
                    <p className="text-sm text-[color:var(--color-text-muted)]">
                      Selecciona al menos una persona para registrar su consumo.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {participantIds.map((id) => (
                      <div
                        key={id}
                        className="rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-3 py-3 text-sm"
                      >
                        <p className="text-xs font-semibold text-[color:var(--color-text-main)]">
                          {resolvePersonName(id, people)}
                        </p>
                        <div className="mt-2 flex items-center rounded-md border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-input)] focus-within:border-[color:var(--color-primary-main)] focus-within:ring-1 focus-within:ring-[color:var(--color-focus-ring)]">
                          <span className="flex h-9 items-center rounded-l-md border border-[color:var(--color-border-subtle)] border-r-0 bg-[color:var(--color-surface-muted)] px-2 text-[10px] font-semibold text-[color:var(--color-text-muted)]">
                            {currency}
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full rounded-r-md border-0 bg-transparent px-2 text-sm text-[color:var(--color-text-main)] outline-none"
                            data-testid={`consumption-${id}`}
                            value={consumptions[id] ?? ''}
                            onChange={(e) =>
                              setConsumptions((curr) => ({
                                ...curr,
                                [id]: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="md:col-span-4 flex flex-wrap items-center justify-end gap-3">
              {editingInvoiceId ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-[color:var(--color-primary-main)] hover:text-[color:var(--color-primary-dark)]"
                  onClick={resetForm}
                >
                  Cancelar edicion
                </button>
              ) : null}
              <Button type="submit" disabled={people.length === 0}>
                <Plus className="h-4 w-4" />
                {editingInvoiceId ? 'Guardar cambios' : 'Guardar gasto'}
              </Button>
            </div>
          </form>
        </div>

        {editingInvoiceId ? (
          <div className="flex items-center justify-between text-xs text-[color:var(--color-text-muted)]">
            <span>Editando gasto seleccionado.</span>
          </div>
        ) : null}

        <div className="space-y-3">
          {invoices.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-6 text-center">
              <p className="text-sm text-[color:var(--color-text-muted)]">
                Aun no has registrado gastos. Agrega la primera arriba.
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
                    <div className="border-t border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] p-4 text-sm text-[color:var(--color-text-main)]">
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
                              Cumpleanero:{' '}
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
                      <div className="mt-3 space-y-2">
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
                                  Cumpleanero
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
  )
}

function resolvePersonName(id: string, people: PersonForUI[]) {
  return people.find((person) => person.id === id)?.name ?? 'Desconocido'
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
