import type { Person, PersonId } from '../../domain/person/Person'
import type { EventId } from '../../domain/event/Event'

export interface PersonRepository {
  listByEvent(eventId: EventId): Promise<Person[]>
  add(eventId: EventId, person: Person): Promise<void>
  update(eventId: EventId, person: Person): Promise<void>
  remove(eventId: EventId, personId: PersonId): Promise<void>
}
