import type { Person, PersonId } from '../../../domain/person/Person'
import type { EventId } from '../../../domain/event/Event'
import type { PersonRepository } from '../../../application/ports/PersonRepository'
import type { EventRepository } from '../../../application/ports/EventRepository'

export class InMemoryPersonRepository implements PersonRepository {
  private readonly eventRepo: EventRepository

  constructor(eventRepo: EventRepository) {
    this.eventRepo = eventRepo
  }

  async listByEvent(eventId: EventId): Promise<Person[]> {
    const event = await this.eventRepo.getById(eventId)
    return event ? event.people.map(clonePerson) : []
  }

  async add(eventId: EventId, person: Person): Promise<void> {
    const event = await this.eventRepo.getById(eventId)
    if (!event) return
    const nextEvent = { ...event, people: [...event.people, clonePerson(person)] }
    await this.eventRepo.save(nextEvent)
  }

  async update(eventId: EventId, person: Person): Promise<void> {
    const event = await this.eventRepo.getById(eventId)
    if (!event) return
    const nextEvent = {
      ...event,
      people: event.people.map((p) => (p.id === person.id ? clonePerson(person) : p)),
    }
    await this.eventRepo.save(nextEvent)
  }

  async remove(eventId: EventId, personId: PersonId): Promise<void> {
    const event = await this.eventRepo.getById(eventId)
    if (!event) return
    const nextEvent = {
      ...event,
      people: event.people.filter((p) => p.id !== personId),
    }
    await this.eventRepo.save(nextEvent)
  }
}

function clonePerson(person: Person): Person {
  return { ...person }
}
