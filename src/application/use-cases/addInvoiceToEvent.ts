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
  const tipAmount = Number(input.tipAmount ?? 0)
  const birthdayPersonId = input.birthdayPersonId
  if (!description) {
    throw new Error('Description is required')
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be greater than 0')
  }
  if (!input.payerId) {
    throw new Error('Payer is required')
  }
  if (input.tipAmount !== undefined && (!Number.isFinite(tipAmount) || tipAmount <= 0)) {
    throw new Error('Tip amount must be greater than 0 when enabled')
  }

  await requireEvent(eventRepo, input.eventId)
  const participants = Array.from(
    new Set([...input.participantIds, input.payerId]),
  )

  if (birthdayPersonId && !participants.includes(birthdayPersonId)) {
    throw new Error('Birthday person must be one of the participants')
  }

  if (birthdayPersonId && participants.length < 2) {
    throw new Error('Birthday person requires at least one additional participant')
  }

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

    if (
      birthdayPersonId &&
      inputConsumptions[birthdayPersonId] === undefined
    ) {
      throw new Error('Birthday person must have a declared consumption (can be 0)')
    }
  }

  const invoice = {
    id: createId(),
    description,
    amount,
    payerId: input.payerId,
    participantIds: participants,
    divisionMethod,
    consumptions,
    tipAmount: tipAmount > 0 ? tipAmount : undefined,
    birthdayPersonId,
  }

  await invoiceRepo.add(input.eventId, invoice)
  return eventRepo.getById(input.eventId)
}
