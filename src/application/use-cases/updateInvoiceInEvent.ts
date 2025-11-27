import type { UpdateInvoiceInput } from '../dto/eventDtos'
import type { EventRepository } from '../ports/EventRepository'
import type { InvoiceRepository } from '../ports/InvoiceRepository'
import { requireEvent } from './helpers'

export async function updateInvoiceInEvent(
  eventRepo: EventRepository,
  invoiceRepo: InvoiceRepository,
  input: UpdateInvoiceInput,
) {
  await requireEvent(eventRepo, input.eventId)
  const participants = Array.from(
    new Set([...input.participantIds, input.payerId]),
  )

  await invoiceRepo.update(input.eventId, {
    id: input.invoiceId,
    description: input.description,
    amount: input.amount,
    payerId: input.payerId,
    participantIds: participants,
  })

  return eventRepo.getById(input.eventId)
}
