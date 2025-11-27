import { calculateBalances, suggestTransfers } from '../../domain/settlement/SettlementService'
import type { EventId } from '../../domain/event/Event'
import type { EventRepository } from '../ports/EventRepository'
import { requireEvent } from './helpers'

export async function calculateSettlement(
  repo: EventRepository,
  eventId: EventId,
) {
  const event = await requireEvent(repo, eventId)
  const balances = calculateBalances(event)
  const transfers = suggestTransfers(balances)

  return { balances, transfers }
}
