import { UserPlus } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { ActionMenu } from '../../shared/components/ActionMenu'
import { Button } from '../../shared/components/ui/button'
import { Input } from '../../shared/components/ui/input'
import { SectionCard } from './SectionCard'
import type { PersonForUI } from '../../shared/state/fairsplitStore'
import { toast } from '../../shared/components/ui/sonner'

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
      setError('Escribe un nombre para continuar.')
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
      setError('Escribe un nombre para continuar.')
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
      toast.warning(message, {
        style: {
          borderColor: 'var(--color-accent-warning)',
          backgroundColor: 'var(--color-warning-bg)',
          color: '#ffffff',
        },
        duration: 3500,
      })
    }
  }

  return (
    <SectionCard
      title="Integrantes"
      description="Invita a las personas del grupo para asignar pagos y consumos."
      badge={people.length > 0 ? `${people.length} integrantes` : undefined}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:max-w-md"
      >
        <Input
          placeholder="Nombre o alias"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="sm:flex-1"
        />
        <Button type="submit" size="sm" disabled={!name.trim()}>
          <UserPlus className="h-4 w-4" />
          Agregar
        </Button>
      </form>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {people.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] p-6 text-center">
            <p className="text-sm text-[color:var(--color-text-muted)]">
              Aun no tienes integrantes. Agrega al menos uno para registrar gastos.
            </p>
          </div>
        ) : (
          people.map((person) => (
            <div
              key={person.id}
              className="card-interactive flex min-h-[84px] flex-wrap items-center justify-between gap-3 rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-card)] px-3 py-3 text-sm text-[color:var(--color-text-main)]"
            >
              {editingId === person.id ? (
                <div
                  className="flex w-full flex-col gap-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      void handleEditSave()
                    }
                  }}
                >
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" size="sm" onClick={handleEditSave}>
                      Guardar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingId(null)
                        setEditingName('')
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="min-w-0 flex-1 truncate font-semibold text-[color:var(--color-text-main)]">
                    {person.name}
                  </span>
                  <div className="shrink-0">
                    <ActionMenu
                      items={[
                        {
                          label: 'Editar',
                          icon: <Pencil className="h-4 w-4" />,
                          onClick: () => startEditing(person),
                        },
                        {
                          label: 'Eliminar',
                          icon: <Trash2 className="h-4 w-4" />,
                          tone: 'danger',
                          onClick: () => handleRemove(person.id),
                        },
                      ]}
                    />
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
