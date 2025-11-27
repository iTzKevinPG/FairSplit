import type { RemoveInvoiceInput } from '../dto/eventDtos'
import type { EventRepository } from '../ports/EventRepository'
import { requireEvent } from './helpers'

export async function removeInvoiceFromEvent(
  repo: EventRepository,
  input: RemoveInvoiceInput,
) {
  const event = await requireEvent(repo, input.eventId)
  const nextEvent = {
    ...event,
    invoices: event.invoices.filter(
      (invoice) => invoice.id !== input.invoiceId,
    ),
  }

  await repo.save(nextEvent)
  return nextEvent
}
