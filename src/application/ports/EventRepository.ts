import type { Event, EventId } from '../../domain/event/Event'

export interface EventRepository {
  list(): Promise<Event[]>
  getById(id: EventId): Promise<Event | undefined>
  save(event: Event): Promise<void>
  delete(id: EventId): Promise<void>
}
