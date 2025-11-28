import { describe, expect, it } from 'vitest'
import type { Event } from '../event/Event'
import type { Invoice } from '../invoice/Invoice'
import type { Person } from '../person/Person'
import { calculateBalances, suggestTransfers } from './SettlementService'

const makeEvent = (people: Person[], invoices: Invoice[]): Event => ({
  id: 'event-1',
  name: 'Test Event',
  currency: 'USD',
  people,
  invoices,
})

describe('Settlement service', () => {
  const people: Person[] = [
    { id: 'p1', name: 'Ana' },
    { id: 'p2', name: 'Beto' },
    { id: 'p3', name: 'Carla' },
  ]

  it('calcula balances y transfers para un caso simple', () => {
    const invoices: Invoice[] = [
      {
        id: 'i1',
        description: 'Cena',
        amount: 60,
        payerId: 'p1',
        participantIds: ['p1', 'p2', 'p3'],
      },
    ]

    const event = makeEvent(people, invoices)
    const balances = calculateBalances(event)
    expect(balances).toEqual([
      { personId: 'p1', totalPaid: 60, totalOwed: 20, net: 40 },
      { personId: 'p2', totalPaid: 0, totalOwed: 20, net: -20 },
      { personId: 'p3', totalPaid: 0, totalOwed: 20, net: -20 },
    ])

    const transfers = suggestTransfers(balances)
    expect(transfers).toEqual([
      { fromPersonId: 'p2', toPersonId: 'p1', amount: 20 },
      { fromPersonId: 'p3', toPersonId: 'p1', amount: 20 },
    ])
  })

  it('soporta varios pagadores', () => {
    const invoices: Invoice[] = [
      {
        id: 'i1',
        description: 'Comida',
        amount: 90,
        payerId: 'p1',
        participantIds: ['p1', 'p2', 'p3'],
      },
      {
        id: 'i2',
        description: 'Taxi',
        amount: 45,
        payerId: 'p2',
        participantIds: ['p1', 'p2'],
      },
    ]

    const event = makeEvent(people, invoices)
    const balances = calculateBalances(event)
    expect(balances).toEqual([
      { personId: 'p1', totalPaid: 90, totalOwed: 52.5, net: 37.5 },
      { personId: 'p2', totalPaid: 45, totalOwed: 52.5, net: -7.5 },
      { personId: 'p3', totalPaid: 0, totalOwed: 30, net: -30 },
    ])

    const transfers = suggestTransfers(balances)
    expect(transfers).toEqual([
      { fromPersonId: 'p3', toPersonId: 'p1', amount: 30 },
      { fromPersonId: 'p2', toPersonId: 'p1', amount: 7.5 },
    ])
  })

  it('aplica redondeo a centavos', () => {
    const invoices: Invoice[] = [
      {
        id: 'i1',
        description: 'Brunch',
        amount: 100,
        payerId: 'p1',
        participantIds: ['p1', 'p2', 'p3'],
      },
    ]

    const event = makeEvent(people, invoices)
    const balances = calculateBalances(event)
    expect(balances).toEqual([
      { personId: 'p1', totalPaid: 100, totalOwed: 33.33, net: 66.67 },
      { personId: 'p2', totalPaid: 0, totalOwed: 33.33, net: -33.33 },
      { personId: 'p3', totalPaid: 0, totalOwed: 33.34, net: -33.34 },
    ])

    const transfers = suggestTransfers(balances)
    expect(transfers).toEqual([
      { fromPersonId: 'p3', toPersonId: 'p1', amount: 33.34 },
      { fromPersonId: 'p2', toPersonId: 'p1', amount: 33.33 },
    ])
  })

  it('maneja factura con unico participante (pagador)', () => {
    const invoices: Invoice[] = [
      {
        id: 'i1',
        description: 'Solo pagador',
        amount: 50,
        payerId: 'p1',
        participantIds: ['p1'],
      },
    ]
    const event = makeEvent(people, invoices)
    const balances = calculateBalances(event)
    expect(balances).toEqual([
      { personId: 'p1', totalPaid: 50, totalOwed: 50, net: 0 },
      { personId: 'p2', totalPaid: 0, totalOwed: 0, net: 0 },
      { personId: 'p3', totalPaid: 0, totalOwed: 0, net: 0 },
    ])
    expect(suggestTransfers(balances)).toEqual([])
  })

  it('calcula consumos individuales', () => {
    const invoices: Invoice[] = [
      {
        id: 'i1',
        description: 'Consumos',
        amount: 100,
        payerId: 'p1',
        participantIds: ['p1', 'p2'],
        divisionMethod: 'consumption',
        consumptions: {
          p1: 60,
          p2: 40,
        },
      },
    ]
    const event = makeEvent(people, invoices)
    const balances = calculateBalances(event)
    expect(balances).toEqual([
      { personId: 'p1', totalPaid: 100, totalOwed: 60, net: 40 },
      { personId: 'p2', totalPaid: 0, totalOwed: 40, net: -40 },
      { personId: 'p3', totalPaid: 0, totalOwed: 0, net: 0 },
    ])
    const transfers = suggestTransfers(balances)
    expect(transfers).toEqual([
      { fromPersonId: 'p2', toPersonId: 'p1', amount: 40 },
    ])
  })

  it('reparte propina igualitaria en modo consumo', () => {
    const invoices: Invoice[] = [
      {
        id: 'i1',
        description: 'Cena',
        amount: 90,
        tipAmount: 10,
        payerId: 'p1',
        participantIds: ['p1', 'p2'],
        divisionMethod: 'consumption',
        consumptions: {
          p1: 60,
          p2: 30,
        },
      },
    ]
    const event = makeEvent(people, invoices)
    const balances = calculateBalances(event)
    expect(balances).toEqual([
      { personId: 'p1', totalPaid: 100, totalOwed: 65, net: 35 },
      { personId: 'p2', totalPaid: 0, totalOwed: 35, net: -35 },
      { personId: 'p3', totalPaid: 0, totalOwed: 0, net: 0 },
    ])
    const transfers = suggestTransfers(balances)
    expect(transfers).toEqual([
      { fromPersonId: 'p2', toPersonId: 'p1', amount: 35 },
    ])
  })
})
