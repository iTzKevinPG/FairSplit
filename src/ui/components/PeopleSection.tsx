import { type FormEvent, useState } from 'react'
import type { PersonForUI } from '../../state/fairsplitStore'
import { SectionCard } from './SectionCard'

interface PeopleSectionProps {
  people: PersonForUI[]
  onAdd: (name: string) => Promise<void>
  onRemove: (personId: string) => Promise<void>
  onEdit: (personId: string, name: string) => Promise<void>
}

export function PeopleSection({
  people,
  onAdd,
  onRemove,
  onEdit,
}: PeopleSectionProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('El nombre es obligatorio.')
      return
    }

    setError(null)
    await onAdd(name.trim())
    setName('')
  }

  const startEditing = (person: PersonForUI) => {
    setEditingId(person.id)
    setEditingName(person.name)
    setError(null)
  }

  const handleEditSave = async () => {
    if (!editingId) return
    if (!editingName.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    setError(null)
    await onEdit(editingId, editingName.trim())
    setEditingId(null)
    setEditingName('')
  }

  const handleRemove = async (personId: string) => {
    try {
      setError(null)
      await onRemove(personId)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'No puedes eliminar este participante.'
      setError(message)
    }
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

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {people.length === 0 ? (
          <p className="text-sm text-slate-600">
            Aun no hay personas. Agrega al menos una para crear facturas.
          </p>
        ) : (
          people.map((person) => (
            <div
              key={person.id}
              className="flex min-h-[90px] flex-col gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm"
            >
              {editingId === person.id ? (
                <div className="flex w-full flex-col gap-2" onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    void handleEditSave()
                  }
                }}>
                  <input
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="text-xs font-semibold text-indigo-700 hover:text-indigo-600"
                      onClick={handleEditSave}
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                      onClick={() => {
                        setEditingId(null)
                        setEditingName('')
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="truncate font-semibold text-slate-900">
                    {person.name}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                      onClick={() => startEditing(person)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="text-xs font-semibold text-slate-500 hover:text-red-600"
                      onClick={() => handleRemove(person.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </SectionCard>
  )
}
