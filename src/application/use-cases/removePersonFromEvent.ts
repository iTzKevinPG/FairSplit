import type { RemovePersonInput } from '../dto/eventDtos'
import type { EventRepository } from '../ports/EventRepository'
import { requireEvent } from './helpers'

export async function removePersonFromEvent(
  repo: EventRepository,
  input: RemovePersonInput,
) {
  const event = await requireEvent(repo, input.eventId)

  const filteredInvoices = event.invoices
    .filter((invoice) => invoice.payerId !== input.personId)
    .map((invoice) => ({
      ...invoice,
      participantIds: invoice.participantIds.filter(
        (id) => id !== input.personId,
      ),
    }))

  const nextEvent = {
    ...event,
    people: event.people.filter((person) => person.id !== input.personId),
    invoices: filteredInvoices,
  }

  await repo.save(nextEvent)
  return nextEvent
}
