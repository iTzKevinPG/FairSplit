import { type FormEvent, useState } from 'react'
import type { EventForUI } from '../../shared/state/fairsplitStore'

interface EventSelectorProps {
  events: EventForUI[]
  selectedEventId?: string
  onSelect: (id: string) => void
  onCreate: (name: string, currency: string) => Promise<void>
}

export function EventSelector({
  events,
  selectedEventId,
  onSelect,
  onCreate,
}: EventSelectorProps) {
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('COP')

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    await onCreate(name.trim(), currency.trim() || 'USD')
    setName('')
  }

  return (
    <div className="space-y-4">
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
        <input
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Moneda"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          disabled={!name.trim()}
        >
          Crear evento
        </button>
      </form>
    </div>
  )
}
