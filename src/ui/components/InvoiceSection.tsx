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

  const canCreate = useMemo(
    () => description.trim() && Number(amount) > 0 && payerId && participantIds.length > 0,
    [description, amount, payerId, participantIds.length],
  )

  const handleToggleParticipant = (id: string) => {
    if (id === payerId) return // payer must stay included
    setParticipantIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
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
    if (participantIds.length === 0) {
      setError('Selecciona al menos un participante.')
      return
    }

    setError(null)
    await onAdd({
      description: trimmedDescription,
      amount: numericAmount,
      payerId,
      participantIds,
    })
    setDescription('')
    setAmount('')
    setParticipantIds(people.map((person) => person.id))
  }

  const detailInvoice = invoices.find((invoice) => invoice.id === detailInvoiceId) ?? null
  const participantShares = detailInvoice
    ? calculateEqualShares(detailInvoice.amount, detailInvoice.participantIds, people)
    : []

  return (
    <SectionCard
      title="Facturas"
      description="Registra facturas con pagador y participantes. El reparto es igualitario."
      actions={
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          {invoices.length} factura(s)
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-4">
        <input
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 md:col-span-2"
          placeholder="Descripcion"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
          <span className="text-xs font-semibold text-slate-500">
            {currency}
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full text-sm text-slate-900 outline-none"
            placeholder="Monto"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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

        <div className="md:col-span-4">
          <p className="text-xs font-semibold tracking-wide text-slate-600">
            Participantes
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {people.length === 0 ? (
              <span className="text-sm text-slate-600">
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
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
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
                      <span className="text-[10px] font-semibold text-slate-500">
                        (Pagador)
                      </span>
                    ) : null}
                  </label>
                )
              })
            )}
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="md:col-span-4 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            disabled={people.length === 0}
          >
            Guardar factura
          </button>
        </div>
      </form>

      <div className="mt-5 space-y-3">
        {invoices.length === 0 ? (
          <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span>Aun no hay facturas registradas.</span>
            <span className="text-xs text-indigo-600">Agrega la primera arriba.</span>
          </div>
        ) : (
          invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-900">
                  {invoice.description}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    ({currency} {invoice.amount.toFixed(2)})
                  </span>
                </p>
                <p className="text-xs text-slate-600">
                  Pago: {resolvePersonName(invoice.payerId, people)}
                </p>
                <p className="text-xs text-slate-600">
                  Participantes ({invoice.participantIds.length}):{' '}
                  {invoice.participantIds
                    .map((id) => resolvePersonName(id, people))
                    .join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
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
                  className="text-xs font-semibold text-slate-500 hover:text-red-600"
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
        <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-slate-800">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-indigo-800">{detailInvoice.description}</p>
              <p className="text-xs text-slate-600">
                Pago: {resolvePersonName(detailInvoice.payerId, people)} · Monto:{' '}
                {currency} {detailInvoice.amount.toFixed(2)}
              </p>
            </div>
            <button
              type="button"
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
              onClick={() => setDetailInvoiceId(null)}
            >
              Cerrar
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {participantShares.map((share) => (
              <div
                key={share.personId}
                className="flex items-center justify-between rounded-md bg-white px-3 py-2 shadow-sm"
              >
                <span className="font-semibold text-slate-900">
                  {resolvePersonName(share.personId, people)}
                </span>
                <span className="text-indigo-700 font-semibold">
                  {currency} {share.amount.toFixed(2)}
                </span>
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

function calculateEqualShares(
  amount: number,
  participantIds: string[],
  people: PersonForUI[],
) {
  if (participantIds.length === 0) return []
  const count = participantIds.length
  const rawShare = amount / count
  const share = roundToCents(rawShare)
  const totalRounded = roundToCents(share * count)
  const diff = roundToCents(amount - totalRounded)

  return participantIds.map((personId, index) => {
    const isLast = index === participantIds.length - 1
    const adjusted = isLast ? roundToCents(share + diff) : share
    return { personId, amount: adjusted, name: resolvePersonName(personId, people) }
  })
}

const roundToCents = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100
