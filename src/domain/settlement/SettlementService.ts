import type { Event } from '../event/Event'
import type { PersonId } from '../person/Person'
import type { Balance } from './Balance'
import type { SettlementTransfer } from './SettlementTransfer'

const EPSILON = 1e-6

const roundToCents = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100

export function calculateBalances(event: Event): Balance[] {
  const balances = new Map<PersonId, Balance>()

  event.people.forEach((person) => {
    balances.set(person.id, {
      personId: person.id,
      totalPaid: 0,
      totalOwed: 0,
      net: 0,
    })
  })

  event.invoices.forEach((invoice) => {
    const participants = invoice.participantIds
    const divisionMethod = invoice.divisionMethod ?? 'equal'
    const count = participants.length
    const shareRaw = count > 0 ? invoice.amount / count : 0
    const share = roundToCents(shareRaw)
    const totalRounded = roundToCents(share * count)
    const diff = roundToCents(invoice.amount - totalRounded)

    const payerBalance = balances.get(invoice.payerId)
    if (payerBalance) {
      payerBalance.totalPaid = roundToCents(payerBalance.totalPaid + invoice.amount)
    }

    if (divisionMethod === 'consumption') {
      const consumptions = invoice.consumptions ?? {}
      const roundedShares: number[] = []
      let sumRounded = 0
      participants.forEach((personId) => {
        const raw = Number(consumptions[personId] ?? 0)
        const rounded = roundToCents(raw)
        roundedShares.push(rounded)
        sumRounded += rounded
      })
      const diffConsumption = roundToCents(invoice.amount - roundToCents(sumRounded))

      participants.forEach((personId, index) => {
        const isLast = index === participants.length - 1
        const baseShare = roundedShares[index] ?? 0
        const adjustedShare = roundToCents(baseShare + (isLast ? diffConsumption : 0))
        const participantBalance = balances.get(personId)
        if (participantBalance) {
          participantBalance.totalOwed = roundToCents(
            participantBalance.totalOwed + adjustedShare,
          )
        }
      })
    } else {
      participants.forEach((personId, index) => {
        const isLast = index === participants.length - 1
        const adjustedShare = isLast ? roundToCents(share + diff) : share
        const participantBalance = balances.get(personId)
        if (participantBalance) {
          participantBalance.totalOwed = roundToCents(
            participantBalance.totalOwed + adjustedShare,
          )
        }
      })
    }
  })

  return Array.from(balances.values()).map((balance) => ({
    ...balance,
    net: roundToCents(balance.totalPaid - balance.totalOwed),
  }))
}

export function suggestTransfers(balances: Balance[]): SettlementTransfer[] {
  const creditors = balances
    .filter((balance) => balance.net > EPSILON)
    .map((balance) => ({
      personId: balance.personId,
      amount: balance.net,
    }))
    .sort((a, b) => b.amount - a.amount)

  const debtors = balances
    .filter((balance) => balance.net < -EPSILON)
    .map((balance) => ({
      personId: balance.personId,
      amount: Math.abs(balance.net),
    }))
    .sort((a, b) => b.amount - a.amount)

  const transfers: SettlementTransfer[] = []
  let debtorIndex = 0
  let creditorIndex = 0

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex]
    const creditor = creditors[creditorIndex]
    const amount = roundToCents(Math.min(debtor.amount, creditor.amount))

    transfers.push({
      fromPersonId: debtor.personId,
      toPersonId: creditor.personId,
      amount,
    })

    debtor.amount = roundToCents(debtor.amount - amount)
    creditor.amount = roundToCents(creditor.amount - amount)

    if (debtor.amount <= EPSILON) {
      debtorIndex++
    }
    if (creditor.amount <= EPSILON) {
      creditorIndex++
    }
  }

  return transfers
}
