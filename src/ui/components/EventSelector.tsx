import { type FormEvent, useState } from 'react'
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
      setError('Escribe un nombre para tu evento.')
      return
    }
    if (!trimmedCurrency) {
      setError('Selecciona una moneda para continuar.')
      return
    }

    setError(null)
    await onCreate(trimmedName, trimmedCurrency)
    setName('')
  }

  return (
    <div className="space-y-4">
      {showSelector ? (
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-[color:var(--color-text-main)]">
            Evento en curso
          </label>
          <select
            className="ds-select min-w-[220px]"
            value={selectedEventId ?? ''}
            onChange={(e) => onSelect(e.target.value)}
          >
            {events.length === 0 ? (
              <option value="">Crea tu primer evento</option>
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
        className="grid gap-3 rounded-xl border border-dashed border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-muted)]/70 p-4 sm:grid-cols-[2fr_1fr_auto]"
      >
        <input
          className="ds-input"
          placeholder="Nombre del evento (ej. Viaje a la playa)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="ds-select"
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
          className="ds-btn ds-btn-primary"
        >
          Crear evento
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
