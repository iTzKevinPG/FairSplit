import { type FormEvent, useState } from 'react'
import type { PersonForUI } from '../../state/fairsplitStore'
import { SectionCard } from './SectionCard'

interface PeopleSectionProps {
  people: PersonForUI[]
  onAdd: (name: string) => Promise<void>
  onRemove: (personId: string) => Promise<void>
}

export function PeopleSection({
  people,
  onAdd,
  onRemove,
}: PeopleSectionProps) {
  const [name, setName] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    await onAdd(name.trim())
    setName('')
  }

  return (
    <SectionCard
      title="Personas"
      description="Agrega a tus amigos para poder asignarlos como pagadores o participantes."
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <input
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Nombre o alias"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          disabled={!name.trim()}
        >
          Agregar
        </button>
      </form>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {people.length === 0 ? (
          <p className="text-sm text-slate-600">
            Aun no hay personas. Agrega al menos una para crear facturas.
          </p>
        ) : (
          people.map((person) => (
            <div
              key={person.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
            >
              <span className="truncate">{person.name}</span>
              <button
                type="button"
                className="text-xs font-semibold text-slate-500 hover:text-red-600"
                onClick={() => onRemove(person.id)}
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
