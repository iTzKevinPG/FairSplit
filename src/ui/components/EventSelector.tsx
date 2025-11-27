import { type FormEvent, useMemo, useState } from 'react'
import type { EventForUI } from '../../shared/state/fairsplitStore'

interface EventSelectorProps {
  events: EventForUI[]
  selectedEventId?: string
  onSelect: (id: string) => void
  onCreate: (name: string, currency: string) => Promise<void>
  showSelector?: boolean
}

const currencyOptions = ['COP', 'USD', 'EUR']

export function EventSelector({
  events,
  selectedEventId,
  onSelect,
  onCreate,
  showSelector = true,
}: EventSelectorProps) {
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('COP')
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    const trimmedName = name.trim()
    const trimmedCurrency = currency.trim()

    if (!trimmedName) {
      setError('El nombre del evento es obligatorio.')
      return
    }
    if (!trimmedCurrency) {
      setError('La moneda es obligatoria.')
      return
    }

    setError(null)
    await onCreate(trimmedName, trimmedCurrency)
    setName('')
  }

  const canCreate = useMemo(
    () => Boolean(name.trim()) && Boolean(currency.trim()),
    [name, currency],
  )

  return (
    <div className="space-y-4">
      {showSelector ? (
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-slate-700">
            Evento activo
          </label>
          <select
            className="min-w-[220px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={selectedEventId ?? ''}
            onChange={(e) => onSelect(e.target.value)}
          >
            {events.length === 0 ? (
              <option value="">Crea un evento para empezar</option>
            ) : null}
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name} ({event.currency})
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <form
        onSubmit={handleCreate}
        className="grid gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-[2fr_1fr_auto]"
      >
        <input
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Nombre del evento"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          {currencyOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
        >
          Crear evento
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
