import { createId } from '../../shared/utils/createId'
import type { AddInvoiceInput } from '../dto/eventDtos'
import type { EventRepository } from '../ports/EventRepository'
import type { InvoiceRepository } from '../ports/InvoiceRepository'
import { requireEvent } from './helpers'

export async function addInvoiceToEvent(
  eventRepo: EventRepository,
  invoiceRepo: InvoiceRepository,
  input: AddInvoiceInput,
) {
  const description = input.description.trim()
  const amount = Number(input.amount)
  if (!description) {
    throw new Error('Description is required')
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be greater than 0')
  }
  if (!input.payerId) {
    throw new Error('Payer is required')
  }

  await requireEvent(eventRepo, input.eventId)
  const participants = Array.from(
    new Set([...input.participantIds, input.payerId]),
  )

  const invoice = {
    id: createId(),
    description,
    amount,
    payerId: input.payerId,
    participantIds: participants,
  }

  await invoiceRepo.add(input.eventId, invoice)
  return eventRepo.getById(input.eventId)
}
