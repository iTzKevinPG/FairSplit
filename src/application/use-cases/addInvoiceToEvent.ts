import { createId } from '../../shared/utils/createId'
import type { AddInvoiceInput } from '../dto/eventDtos'
import type { EventRepository } from '../ports/EventRepository'
import { requireEvent } from './helpers'

export async function addInvoiceToEvent(
  repo: EventRepository,
  input: AddInvoiceInput,
) {
  const event = await requireEvent(repo, input.eventId)

  const participants = Array.from(
    new Set([...input.participantIds, input.payerId]),
  )

  const nextEvent = {
    ...event,
    invoices: [
      ...event.invoices,
      {
        id: createId(),
        description: input.description,
        amount: input.amount,
        payerId: input.payerId,
        participantIds: participants,
      },
    ],
  }

  await repo.save(nextEvent)
  return nextEvent
}
