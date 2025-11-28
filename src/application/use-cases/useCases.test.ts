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

  it('rejects birthday without another participant to split', async () => {
    const eventRepo = new InMemoryEventRepository()
    const personRepo = new InMemoryPersonRepository(eventRepo)
    const invoiceRepo = new InMemoryInvoiceRepository(eventRepo)

    const event = await createEvent(eventRepo, { name: 'Party', currency: 'USD' })
    const person = await addPersonToEvent(eventRepo, personRepo, {
      eventId: event.id,
      name: 'Solo',
    })
    const payerId = person?.people[0].id as string

    await expect(
      addInvoiceToEvent(eventRepo, invoiceRepo, {
        eventId: event.id,
        description: 'Cena',
        amount: 50,
        payerId,
        participantIds: [payerId],
        birthdayPersonId: payerId,
      }),
    ).rejects.toThrow(/birthday person requires at least one additional participant/i)
  })

  it('allows marking birthday and redistributes consumption', async () => {
    const eventRepo = new InMemoryEventRepository()
    const personRepo = new InMemoryPersonRepository(eventRepo)
    const invoiceRepo = new InMemoryInvoiceRepository(eventRepo)

    const event = await createEvent(eventRepo, { name: 'Party', currency: 'USD' })
    await addPersonToEvent(eventRepo, personRepo, { eventId: event.id, name: 'Ana' })
    await addPersonToEvent(eventRepo, personRepo, { eventId: event.id, name: 'Ben' })
    await addPersonToEvent(eventRepo, personRepo, { eventId: event.id, name: 'Cara' })

    const updated = await eventRepo.getById(event.id)
    const payerId = updated?.people[0].id as string
    const birthdayId = updated?.people[2].id as string

    await addInvoiceToEvent(eventRepo, invoiceRepo, {
      eventId: event.id,
      description: 'Cena',
      amount: 90,
      payerId,
      participantIds: updated?.people.map((p) => p.id) ?? [],
      birthdayPersonId: birthdayId,
    })

    const settlement = await calculateSettlement(eventRepo, event.id)
    expect(settlement.balances.find((b) => b.personId === payerId)).toEqual({
      personId: payerId,
      totalPaid: 90,
      totalOwed: 45,
      net: 45,
    })
    expect(settlement.balances.find((b) => b.personId === birthdayId)).toEqual({
      personId: birthdayId,
      totalPaid: 0,
      totalOwed: 0,
      net: 0,
    })
  })
})
