import type { Event } from '../../domain/event/Event'
import { createId } from '../../shared/utils/createId'
import type { CreateEventInput } from '../dto/eventDtos'
import type { EventRepository } from '../ports/EventRepository'

export async function createEvent(
  repo: EventRepository,
  input: CreateEventInput,
): Promise<Event> {
  const event: Event = {
    id: createId(),
    name: input.name,
    currency: input.currency,
    people: [],
    invoices: [],
  }

  await repo.save(event)
  return event
}
