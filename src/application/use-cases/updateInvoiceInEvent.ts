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

  const divisionMethod = input.divisionMethod ?? 'equal'
  let consumptions: Record<string, number> | undefined
  if (divisionMethod === 'consumption') {
    const inputConsumptions = input.consumptions ?? {}
    const normalized = participants.reduce<Record<string, number>>(
      (acc, personId) => {
        const value = Number(inputConsumptions[personId] ?? 0)
        acc[personId] = value
        return acc
      },
      {},
    )
    const sumConsumptions = Object.values(normalized).reduce(
      (acc, val) => acc + val,
      0,
    )
    const hasPositive = Object.values(normalized).some((val) => val > 0)
    if (!hasPositive || sumConsumptions <= 0) {
      throw new Error('At least one participant must have consumption > 0')
    }
    const diff = Math.abs(Number(input.amount) - sumConsumptions)
    if (diff > 0.01) {
      throw new Error(
        'Sum of consumptions must match invoice amount (difference > 0.01)',
      )
    }
    consumptions = normalized
  }

  await invoiceRepo.update(input.eventId, {
    id: input.invoiceId,
    description: input.description,
    amount: input.amount,
    payerId: input.payerId,
    participantIds: participants,
    divisionMethod,
    consumptions,
  })

  return eventRepo.getById(input.eventId)
}
