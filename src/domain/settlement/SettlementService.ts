import type { Event } from '../event/Event'
import type { PersonId } from '../person/Person'
import type { Balance } from './Balance'
import type { SettlementTransfer } from './SettlementTransfer'

const EPSILON = 1e-6

const roundToCents = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100

function buildTipPortion(
  personId: PersonId,
  tipReceivers: PersonId[],
  tipShare: number,
  tipDiff: number,
) {
  if (!tipReceivers.includes(personId)) return 0
  const isLastTipReceiver =
    tipReceivers.length > 0 &&
    personId === tipReceivers[tipReceivers.length - 1]
  return roundToCents(tipShare + (isLastTipReceiver ? tipDiff : 0))
}

function redistributeBirthday(
  baseShares: number[],
  participants: PersonId[],
  birthdayPersonId?: PersonId,
) {
  if (!birthdayPersonId) return baseShares
  const birthdayIndex = participants.findIndex((id) => id === birthdayPersonId)
  if (birthdayIndex === -1 || participants.length <= 1) return baseShares

  const updated = [...baseShares]
  const birthdayBase = updated[birthdayIndex] ?? 0
  updated[birthdayIndex] = 0

  const others = participants.filter((id) => id !== birthdayPersonId)
  const perOther = roundToCents(birthdayBase / others.length)
  const totalRounded = roundToCents(perOther * others.length)
  const diff = roundToCents(birthdayBase - totalRounded)

  others.forEach((id, index) => {
    const target = participants.indexOf(id)
    updated[target] = roundToCents(
      (updated[target] ?? 0) + perOther + (index === others.length - 1 ? diff : 0),
    )
  })

  return updated
}

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
    const tip = roundToCents(invoice.tipAmount ?? 0)
    const tipReceivers = invoice.birthdayPersonId
      ? participants.filter((id) => id !== invoice.birthdayPersonId)
      : participants
    const tipShare =
      tipReceivers.length > 0 ? roundToCents(tip / tipReceivers.length) : 0
    const tipTotalRounded = roundToCents(tipShare * tipReceivers.length)
    const tipDiff = roundToCents(tip - tipTotalRounded)

    const payerBalance = balances.get(invoice.payerId)
    if (payerBalance) {
      payerBalance.totalPaid = roundToCents(
        payerBalance.totalPaid + invoice.amount + tip,
      )
    }

    if (divisionMethod === 'consumption') {
      const consumptions = invoice.consumptions ?? {}
      const roundedShares = participants.map((personId) =>
        roundToCents(Number(consumptions[personId] ?? 0)),
      )
      const sumRounded = roundedShares.reduce((acc, val) => acc + val, 0)
      const diffConsumption = roundToCents(invoice.amount - roundToCents(sumRounded))

      const adjustedBases = roundedShares.map((base, index) =>
        roundToCents(base + (index === participants.length - 1 ? diffConsumption : 0)),
      )

      const withBirthday = redistributeBirthday(
        adjustedBases,
        participants,
        invoice.birthdayPersonId,
      )

      participants.forEach((personId, index) => {
        const adjustedBase = withBirthday[index] ?? 0
        const adjustedTip = buildTipPortion(
          personId,
          tipReceivers,
          tipShare,
          tipDiff,
        )
        const participantBalance = balances.get(personId)
        if (participantBalance) {
          participantBalance.totalOwed = roundToCents(
            participantBalance.totalOwed + adjustedBase + adjustedTip,
          )
        }
      })
    } else {
      const adjustedBaseShares = participants.map((_, index) => {
        const isLast = index === participants.length - 1
        return isLast ? roundToCents(share + diff) : share
      })

      const withBirthday = redistributeBirthday(
        adjustedBaseShares,
        participants,
        invoice.birthdayPersonId,
      )

      participants.forEach((personId, index) => {
        const adjustedShare = withBirthday[index] ?? 0
        const adjustedTip = buildTipPortion(
          personId,
          tipReceivers,
          tipShare,
          tipDiff,
        )
        const participantBalance = balances.get(personId)
        if (participantBalance) {
          participantBalance.totalOwed = roundToCents(
            participantBalance.totalOwed + adjustedShare + adjustedTip,
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
