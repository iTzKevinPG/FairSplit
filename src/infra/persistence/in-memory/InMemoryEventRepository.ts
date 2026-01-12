import type { Event, EventId } from '../../../domain/event/Event'
import type { EventRepository } from '../../../application/ports/EventRepository'

export class InMemoryEventRepository implements EventRepository {
  private events = new Map<EventId, Event>()

  async list(): Promise<Event[]> {
    return Array.from(this.events.values()).map(cloneEvent)
  }

  async getById(id: EventId): Promise<Event | undefined> {
    const event = this.events.get(id)
    return event ? cloneEvent(event) : undefined
  }

  async save(event: Event): Promise<void> {
    this.events.set(event.id, cloneEvent(event))
  }

  async delete(id: EventId): Promise<void> {
    this.events.delete(id)
  }
}

function cloneEvent(event: Event): Event {
  return {
    ...event,
    people: event.people.map((person) => ({ ...person })),
    invoices: event.invoices.map((invoice) => ({
      ...invoice,
      participantIds: [...invoice.participantIds],
      items: invoice.items
        ? invoice.items.map((item) => ({
            ...item,
            participantIds: [...item.participantIds],
          }))
        : undefined,
    })),
  }
}
