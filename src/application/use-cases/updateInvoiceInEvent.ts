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

  const birthdayPersonId = input.birthdayPersonId
  if (birthdayPersonId && !participants.includes(birthdayPersonId)) {
    throw new Error('Birthday person must be one of the participants')
  }
  if (birthdayPersonId && participants.length < 2) {
    throw new Error('Birthday person requires at least one additional participant')
  }

  const divisionMethod = input.divisionMethod ?? 'equal'
  let consumptions: Record<string, number> | undefined
  const tipAmount = Number(input.tipAmount ?? 0)
  if (input.tipAmount !== undefined && (!Number.isFinite(tipAmount) || tipAmount <= 0)) {
    throw new Error('Tip amount must be greater than 0 when enabled')
  }
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

    if (
      birthdayPersonId &&
      inputConsumptions[birthdayPersonId] === undefined
    ) {
      throw new Error('Birthday person must have a declared consumption (can be 0)')
    }
  }

  await invoiceRepo.update(input.eventId, {
    id: input.invoiceId,
    description: input.description,
    amount: input.amount,
    payerId: input.payerId,
    participantIds: participants,
    divisionMethod,
    consumptions,
    items: input.items,
    tipAmount: tipAmount > 0 ? tipAmount : undefined,
    birthdayPersonId,
  })

  return eventRepo.getById(input.eventId)
}
