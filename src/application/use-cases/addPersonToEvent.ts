import { createId } from '../../shared/utils/createId'
import type { AddPersonInput } from '../dto/eventDtos'
import type { EventRepository } from '../ports/EventRepository'
import { requireEvent } from './helpers'

export async function addPersonToEvent(
  repo: EventRepository,
  input: AddPersonInput,
) {
  const event = await requireEvent(repo, input.eventId)
  const nextEvent = {
    ...event,
    people: [...event.people, { id: createId(), name: input.name }],
  }

  await repo.save(nextEvent)
  return nextEvent
}
