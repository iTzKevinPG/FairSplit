import type { Event } from '../../domain/event/Event'
import { createId } from '../../shared/utils/createId'
import type { CreateEventInput } from '../dto/eventDtos'
import type { EventRepository } from '../ports/EventRepository'

export async function createEvent(
  eventRepo: EventRepository,
  input: CreateEventInput,
): Promise<Event> {
  const name = input.name.trim()
  const currency = input.currency.trim()

  if (!name) {
    throw new Error('Event name is required')
  }
  if (!currency) {
    throw new Error('Currency is required')
  }

  const event: Event = {
    id: input.id ?? createId(),
    name,
    currency,
    people: [],
    invoices: [],
  }

  await eventRepo.save(event)
  return event
}
