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
    const diff = Math.abs(amount - sumConsumptions)
    if (diff > 0.01) {
      throw new Error(
        'Sum of consumptions must match invoice amount (difference > 0.01)',
      )
    }
    consumptions = normalized
  }

  const invoice = {
    id: createId(),
    description,
    amount,
    payerId: input.payerId,
    participantIds: participants,
    divisionMethod,
    consumptions,
  }

  await invoiceRepo.add(input.eventId, invoice)
  return eventRepo.getById(input.eventId)
}
