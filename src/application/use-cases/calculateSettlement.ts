import { calculateBalances, suggestTransfers } from '../../domain/settlement/SettlementService'
import type { EventId } from '../../domain/event/Event'
import type { EventRepository } from '../ports/EventRepository'
import { requireEvent } from './helpers'

export async function calculateSettlement(
  eventRepo: EventRepository,
  eventId: EventId,
) {
  const event = await requireEvent(eventRepo, eventId)
  const balances = calculateBalances(event)
  const transfers = suggestTransfers(balances)

  return { balances, transfers }
}
