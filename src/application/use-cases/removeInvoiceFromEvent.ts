import type { RemoveInvoiceInput } from '../dto/eventDtos'
import type { EventRepository } from '../ports/EventRepository'
import type { InvoiceRepository } from '../ports/InvoiceRepository'
import { requireEvent } from './helpers'

export async function removeInvoiceFromEvent(
  eventRepo: EventRepository,
  invoiceRepo: InvoiceRepository,
  input: RemoveInvoiceInput,
) {
  await invoiceRepo.remove(input.eventId, input.invoiceId)
  return eventRepo.getById(input.eventId)
}
