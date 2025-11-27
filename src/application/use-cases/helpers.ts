import type { Event, EventId } from '../../domain/event/Event'
import type { EventRepository } from '../ports/EventRepository'

export async function requireEvent(
  repo: EventRepository,
  eventId: EventId,
): Promise<Event> {
  const event = await repo.getById(eventId)
  if (!event) {
    throw new Error('Event not found')
  }
  return event
}
