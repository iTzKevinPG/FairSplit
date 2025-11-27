import type { UpdateInvoiceInput } from '../dto/eventDtos'
import type { EventRepository } from '../ports/EventRepository'
import { requireEvent } from './helpers'

export async function updateInvoiceInEvent(
  repo: EventRepository,
  input: UpdateInvoiceInput,
) {
  const event = await requireEvent(repo, input.eventId)
  const participants = Array.from(
    new Set([...input.participantIds, input.payerId]),
  )

  const nextEvent = {
    ...event,
    invoices: event.invoices.map((invoice) =>
      invoice.id === input.invoiceId
        ? {
            ...invoice,
            description: input.description,
            amount: input.amount,
            payerId: input.payerId,
            participantIds: participants,
          }
        : invoice,
    ),
  }

  await repo.save(nextEvent)
  return nextEvent
}
