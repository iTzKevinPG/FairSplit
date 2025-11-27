import type { UpdatePersonInput } from '../dto/eventDtos'
import type { EventRepository } from '../ports/EventRepository'
import type { PersonRepository } from '../ports/PersonRepository'
import { requireEvent } from './helpers'

export async function updatePersonInEvent(
  eventRepo: EventRepository,
  personRepo: PersonRepository,
  input: UpdatePersonInput,
) {
  const name = input.name.trim()
  if (!name) {
    throw new Error('Person name is required')
  }
  await requireEvent(eventRepo, input.eventId)
  await personRepo.update(input.eventId, { id: input.personId, name })
  return eventRepo.getById(input.eventId)
}
