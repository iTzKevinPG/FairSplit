import { type FormEvent, useMemo, useState } from 'react'
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
  onRemove: (invoiceId: string) => Promise<void>
}

export function InvoiceSection({
  invoices,
  people,
  currency,
  onAdd,
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

  const handleToggleParticipant = (id: string) => {
    if (id === payerId) return // payer must stay included
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
        setError('Selecciona a la persona cumpleañera.')
        return
      }
      if (!participantIds.includes(birthdayPersonId)) {
        setError('El cumpleañero debe estar en la lista de participantes.')
        return
      }
      if (participantIds.length < 2) {
        setError('Se necesita al menos otra persona para repartir el consumo del cumpleañero.')
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
        setError('El cumpleañero debe tener un consumo declarado (puede ser 0).')
        return
      }
      consumptionPayload = numericConsumptions
    }

    setError(null)
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
    setDescription('')
    setAmount('')
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
  }

  const detailInvoice = invoices.find((invoice) => invoice.id === detailInvoiceId) ?? null
  const participantShares = detailInvoice ? calculateShares(detailInvoice, people) : []
  const consumptionSum = useMemo(() => {
    if (divisionMethod !== 'consumption') return 0
    return participantIds.reduce((acc, id) => acc + Number(consumptions[id] ?? 0), 0)
  }, [divisionMethod, participantIds, consumptions])

  return (
    <SectionCard
      title="Facturas"
      description="Registra facturas con pagador y participantes. Elige reparto igualitario o por consumo, con propina y cumpleañero opcional."
      actions={
        <span className="rounded-full accent-chip px-3 py-1 text-xs font-semibold text-accent">
          {invoices.length} factura(s)
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-4">
        <input
          className="ds-input md:col-span-2"
          placeholder="Descripcion"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex items-center gap-2 rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-3 py-2 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
          <span className="text-xs font-semibold text-[color:var(--color-text-muted)]">
            {currency}
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full bg-transparent text-sm text-[color:var(--color-text-main)] outline-none"
            placeholder="Monto"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
       </div>

        <div className="md:col-span-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeTip}
              onChange={(e) => setIncludeTip(e.target.checked)}
              className="accent-indigo-600"
              id="include-tip"
              disabled={people.length === 0}
            />
            <label htmlFor="include-tip" className="text-xs font-semibold text-slate-500">
              Incluir propina
            </label>
          </div>
          {includeTip ? (
            <div className="flex items-center gap-2 rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-3 py-2 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
              <span className="text-xs font-semibold text-[color:var(--color-text-muted)]">{currency}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full bg-transparent text-sm text-[color:var(--color-text-main)] outline-none"
                placeholder="Propina"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
              />
            </div>
          ) : null}
          <span className="text-[11px] text-[color:var(--color-text-muted)]" title="La propina se reparte igualitariamente entre los participantes al guardar la factura.">
            La propina se reparte igualitario al guardar.
          </span>
        </div>

        <div className="md:col-span-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={birthdayEnabled}
              onChange={(e) => setBirthdayEnabled(e.target.checked)}
              className="accent-indigo-600"
              id="birthday-toggle"
              disabled={participantIds.length === 0}
            />
            <label htmlFor="birthday-toggle" className="text-xs font-semibold text-slate-500">
              Marcar cumpleañero
            </label>
          </div>
          {birthdayEnabled ? (
            <>
            <div>
              <select
                className="ds-select"
                value={birthdayPersonId}
                onChange={(e) => setBirthdayPersonId(e.target.value)}
                aria-label="Selecciona cumpleañero"
              >
                <option value="">Selecciona cumpleañero</option>
                {participantIds.map((id) => (
                  <option key={id} value={id}>
                    {resolvePersonName(id, people)}
                  </option>
                ))}
              </select>
            </div>
              <span
                className="text-[11px] text-[color:var(--color-text-muted)]"
                title="El consumo del cumpleañero se reparte entre el resto de participantes al guardar."
              >
                🎉 El consumo del cumpleañero se reparte al resto.
              </span>
            </>
          ) : (
            <span className="text-[11px] text-[color:var(--color-text-muted)]" title="Marca un cumpleañero para que su consumo se reparta entre el resto.">
              (Opcional) Marca a un cumpleañero para repartir su consumo.
            </span>
          )}
        </div>
        <select
          className="ds-select"
          value={payerId ?? ''}
          onChange={(e) => setPayerId(e.target.value)}
          disabled={people.length === 0}
        >
          <option value="">Selecciona pagador</option>
          {people.length === 0 ? (
            <option>No hay personas</option>
          ) : (
            people.map((person) => (
              <option key={person.id} value={person.id}>
                Pago: {person.name}
              </option>
            ))
          )}
        </select>

        <select
          className="ds-select"
          value={divisionMethod}
          onChange={(e) => setDivisionMethod(e.target.value as 'equal' | 'consumption')}
        >
          <option value="equal">Reparto igualitario</option>
          <option value="consumption">Por consumo</option>
        </select>

        <div className="md:col-span-4">
          <p className="text-xs font-semibold tracking-wide text-[color:var(--color-text-muted)]">
            Participantes
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {people.length === 0 ? (
              <span className="text-sm text-[color:var(--color-text-muted)]">
                Agrega personas para asignar participantes.
              </span>
            ) : (
              people.map((person) => {
                const checked = participantIds.includes(person.id)
                const isPayer = person.id === payerId
                return (
                  <label
                    key={person.id}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm transition ${
                      checked
                        ? 'border-indigo-300 accent-chip text-accent'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-indigo-600"
                      checked={checked}
                      disabled={isPayer}
                      onChange={() => handleToggleParticipant(person.id)}
                    />
                    {person.name}
                    {isPayer ? (
                      <span className="text-[10px] font-semibold text-[color:var(--color-text-muted)]">
                        (Pagador)
                      </span>
                    ) : null}
                  </label>
                )
              })
            )}
          </div>
        </div>

        {divisionMethod === 'consumption' ? (
          <div className="md:col-span-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-wide text-[color:var(--color-text-muted)]">
                Consumo por participante
              </p>
              <p className="text-[11px] font-semibold text-[color:var(--color-text-muted)]">
                Suma ingresada: {currency} {roundToCents(consumptionSum).toFixed(2)}
              </p>
            </div>
              <div className="mt-2 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {participantIds.map((id) => (
                  <div
                    key={id}
                    className="rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] px-3 py-2 text-sm shadow-sm"
                  >
                    <p className="text-xs font-semibold text-[color:var(--color-text-muted)]">
                      {resolvePersonName(id, people)}
                    </p>
                    <div className="flex items-center gap-2 rounded-md border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-2 py-1 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                      <span className="text-[10px] font-semibold text-[color:var(--color-text-muted)]">
                        {currency}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full bg-transparent text-sm text-[color:var(--color-text-main)] outline-none"
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
          </div>
        ) : null}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="md:col-span-4 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:accent-chip0 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-[color:var(--color-text-muted)]"
            disabled={people.length === 0}
          >
            Guardar factura
          </button>
        </div>
      </form>

      <div className="mt-5 space-y-3">
        {invoices.length === 0 ? (
          <div className="ds-card flex items-center justify-between rounded-lg">
            <span className='text-sm'>Aun no hay facturas registradas.</span>
            <span className="text-xs text-accent">Agrega la primera arriba.</span>
          </div>
        ) : (
          invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex flex-col gap-2 rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] px-3 py-2 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-accent">
                  {invoice.description}{' '}
                  <span className="text-xs font-normal text-[color:var(--color-text-muted)]">
                    ({currency} {invoice.amount.toFixed(2)})
                  </span>
                </p>
                <p className="text-xs text-[color:var(--color-text-muted)]">
                  Pago: {resolvePersonName(invoice.payerId, people)}
                </p>
                <p className="text-xs text-[color:var(--color-text-muted)]">
                  Participantes ({invoice.participantIds.length}):{' '}
                  {invoice.participantIds
                    .map((id) => resolvePersonName(id, people))
                    .join(', ')}
                </p>
                {invoice.birthdayPersonId ? (
                  <p className="text-xs text-accent font-semibold">
                    Cumpleañero: {resolvePersonName(invoice.birthdayPersonId, people)}
                  </p>
                ) : null}
                {invoice.tipAmount ? (
                  <p className="text-xs text-[color:var(--color-text-muted)]">
                    Propina: {currency} {invoice.tipAmount.toFixed(2)}
                  </p>
                ) : null}
                {invoice.divisionMethod === 'consumption' ? (
                  <p className="text-[10px] uppercase tracking-wide text-[color:var(--color-text-muted)]">
                    Metodo: Consumo
                  </p>
                ) : (
                  <p className="text-[10px] uppercase tracking-wide text-[color:var(--color-text-muted)]">
                    Metodo: Igualitario
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-xs font-semibold text-accent hover:text-indigo-500"
                  onClick={() =>
                    setDetailInvoiceId((current) =>
                      current === invoice.id ? null : invoice.id,
                    )
                  }
                >
                  Ver detalle
                </button>
                <button
                  type="button"
                  className="text-xs font-semibold text-[color:var(--color-text-muted)] hover:text-red-600"
                  onClick={() => onRemove(invoice.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {detailInvoice ? (
        <div className="mt-4 rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)] p-4 text-sm text-[color:var(--color-text-main)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-accent">{detailInvoice.description}</p>
              <p className="text-xs text-[color:var(--color-text-muted)]">
                Pago: {resolvePersonName(detailInvoice.payerId, people)} · Monto:{' '}
                {currency} {detailInvoice.amount.toFixed(2)}
                {detailInvoice.tipAmount
                  ? ` · Propina: ${currency} ${detailInvoice.tipAmount.toFixed(2)}`
                  : ''}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--color-text-muted)]">
                Metodo:{' '}
                {detailInvoice.divisionMethod === 'consumption'
                  ? 'Consumo'
                  : 'Igualitario'}
              </p>
              {detailInvoice.birthdayPersonId ? (
                <p className="text-[11px] font-semibold text-accent">
                  Cumpleañero: {resolvePersonName(detailInvoice.birthdayPersonId, people)}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className="text-xs font-semibold text-[color:var(--color-text-muted)] hover:text-slate-700"
              onClick={() => setDetailInvoiceId(null)}
            >
              Cerrar
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {participantShares.map((share) => (
              <div
                key={share.personId}
                className={`flex items-center justify-between rounded-md bg-[color:var(--color-border-subtle)] px-3 py-2 shadow-sm ${
                  share.isBirthday ? 'border border-[color:var(--color-primary-light)]' : ''
                }`}
              >
                <span className="font-semibold text-[color:var(--color-text-main)]">
                  {resolvePersonName(share.personId, people)}
                  {share.isBirthday ? (
                    <span className="ml-2 rounded-full accent-chip px-2 py-0.5 text-[10px] font-semibold text-accent">
                      Cumpleañero
                    </span>
                  ) : null}
                </span>
                <div className="text-right">
                  {share.tipPortion ? (
                    <p className="text-[11px] text-[color:var(--color-text-muted)]">
                      Propina: {currency} {share.tipPortion.toFixed(2)}
                    </p>
                  ) : null}
                  <p className="text-accent font-semibold">
                    Total: {currency} {share.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
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
    const totalRounded = roundToCents(
      rounded.reduce((acc, val) => acc + val, 0),
    )
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
    const adjustedTip = buildTipPortion(
      personId,
      tipReceivers,
      tipShare,
      tipDiff,
    )
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
  const isLastTip = tipReceivers.length > 0 &&
    personId === tipReceivers[tipReceivers.length - 1]
  return roundToCents(tipShare + (isLastTip ? tipDiff : 0))
}


