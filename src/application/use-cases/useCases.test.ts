import { describe, expect, it } from 'vitest'
import { addInvoiceToEvent } from './addInvoiceToEvent'
import { addPersonToEvent } from './addPersonToEvent'
import { calculateSettlement } from './calculateSettlement'
import { createEvent } from './createEvent'
import { InMemoryEventRepository } from '../../infra/persistence/in-memory/InMemoryEventRepository'
import { InMemoryPersonRepository } from '../../infra/persistence/in-memory/InMemoryPersonRepository'
import { InMemoryInvoiceRepository } from '../../infra/persistence/in-memory/InMemoryInvoiceRepository'

describe('Application use cases (in-memory)', () => {
  it('rejects creating an event without name or currency', async () => {
    const eventRepo = new InMemoryEventRepository()
    await expect(
      createEvent(eventRepo, { name: '', currency: 'USD' }),
    ).rejects.toThrow(/name/i)
    await expect(
      createEvent(eventRepo, { name: 'Trip', currency: '' }),
    ).rejects.toThrow(/currency/i)
  })

  it('creates event, adds people and invoices, then settles', async () => {
    const eventRepo = new InMemoryEventRepository()
    const personRepo = new InMemoryPersonRepository(eventRepo)
    const invoiceRepo = new InMemoryInvoiceRepository(eventRepo)

    const event = await createEvent(eventRepo, { name: 'Trip', currency: 'USD' })
    await addPersonToEvent(eventRepo, personRepo, { eventId: event.id, name: 'Ana' })
    await addPersonToEvent(eventRepo, personRepo, { eventId: event.id, name: 'Ben' })

    const updated = await eventRepo.getById(event.id)
    expect(updated?.people).toHaveLength(2)

    await addInvoiceToEvent(eventRepo, invoiceRepo, {
      eventId: event.id,
      description: 'Dinner',
      amount: 80,
      payerId: updated?.people[0].id as string,
      participantIds: updated?.people.map((p) => p.id) ?? [],
      tipAmount: 10,
    })

    const settlement = await calculateSettlement(eventRepo, event.id)
    expect(settlement.balances).toEqual([
      { personId: updated?.people[0].id, totalPaid: 90, totalOwed: 45, net: 45 },
      { personId: updated?.people[1].id, totalPaid: 0, totalOwed: 45, net: -45 },
    ])

    expect(settlement.transfers).toEqual([
      {
        fromPersonId: updated?.people[1].id,
        toPersonId: updated?.people[0].id,
        amount: 45,
      },
    ])
  })
})
