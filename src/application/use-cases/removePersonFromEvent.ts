import type { RemovePersonInput } from '../dto/eventDtos'
import type { EventRepository } from '../ports/EventRepository'
import { requireEvent } from './helpers'

export async function removePersonFromEvent(
  eventRepo: EventRepository,
  input: RemovePersonInput,
) {
  const event = await requireEvent(eventRepo, input.eventId)

  const hasInvoices = event.invoices.some(
    (invoice) =>
      invoice.payerId === input.personId ||
      invoice.participantIds.includes(input.personId),
  )

  if (hasInvoices) {
    throw new Error(
      'No puedes eliminar participantes que tienen facturas asociadas',
    )
  }

  // Drop invoices where the person was payer; remove participation otherwise
  const remainingInvoices = event.invoices.filter(
    (invoice) => invoice.payerId !== input.personId,
  )
  const adjustedInvoices = remainingInvoices.map((invoice) => ({
    ...invoice,
    participantIds: invoice.participantIds.filter(
      (id) => id !== input.personId,
    ),
  }))

  const nextEvent = {
    ...event,
    people: event.people.filter((person) => person.id !== input.personId),
    invoices: adjustedInvoices,
  }

  // Persist through the aggregate repo as single source of truth
  await eventRepo.save(nextEvent)
  return nextEvent
}
