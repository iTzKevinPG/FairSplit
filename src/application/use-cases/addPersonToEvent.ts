import { createId } from '../../shared/utils/createId'
import type { AddPersonInput } from '../dto/eventDtos'
import type { EventRepository } from '../ports/EventRepository'
import type { PersonRepository } from '../ports/PersonRepository'
import { requireEvent } from './helpers'

export async function addPersonToEvent(
  eventRepo: EventRepository,
  personRepo: PersonRepository,
  input: AddPersonInput,
) {
  const name = input.name.trim()
  if (!name) {
    throw new Error('Person name is required')
  }

  await requireEvent(eventRepo, input.eventId)
  const person = { id: createId(), name }
  await personRepo.add(input.eventId, person)
  return eventRepo.getById(input.eventId)
}
