import type { UpdatePersonInput } from '../dto/eventDtos'
import type { EventRepository } from '../ports/EventRepository'
import { requireEvent } from './helpers'

export async function updatePersonInEvent(
  repo: EventRepository,
  input: UpdatePersonInput,
) {
  const event = await requireEvent(repo, input.eventId)
  const nextEvent = {
    ...event,
    people: event.people.map((person) =>
      person.id === input.personId ? { ...person, name: input.name } : person,
    ),
  }

  await repo.save(nextEvent)
  return nextEvent
}
