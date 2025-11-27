import { type FormEvent, useMemo, useState } from 'react'
import type { InvoiceForUI, PersonForUI } from '../../state/fairsplitStore'
import { SectionCard } from './SectionCard'

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

  const canCreate = useMemo(
    () => description.trim() && Number(amount) > 0 && payerId && participantIds.length > 0,
    [description, amount, payerId, participantIds.length],
  )

  const handleToggleParticipant = (id: string) => {
    setParticipantIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!canCreate || !payerId) return
    await onAdd({
      description: description.trim(),
      amount: Number(amount),
      payerId,
      participantIds,
    })
    setDescription('')
    setAmount('')
    setParticipantIds(people.map((person) => person.id))
  }

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
          value={payerId}
          onChange={(e) => setPayerId(e.target.value)}
          disabled={people.length === 0}
        >
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
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                      onChange={() => handleToggleParticipant(person.id)}
                    />
                    {person.name}
                  </label>
                )
              })
            )}
          </div>
        </div>

        <div className="md:col-span-4 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            disabled={!canCreate || people.length === 0}
          >
            Guardar factura
          </button>
        </div>
      </form>

      <div className="mt-5 space-y-3">
        {invoices.length === 0 ? (
          <p className="text-sm text-slate-600">
            Aun no hay facturas registradas.
          </p>
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
                  Participantes: {invoice.participantIds
                    .map((id) => resolvePersonName(id, people))
                    .join(', ')}
                </p>
              </div>
              <button
                type="button"
                className="self-start text-xs font-semibold text-slate-500 hover:text-red-600"
                onClick={() => onRemove(invoice.id)}
              >
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  )
}

function resolvePersonName(id: string, people: PersonForUI[]) {
  return people.find((person) => person.id === id)?.name ?? 'Desconocido'
}
