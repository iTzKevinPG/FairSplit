import { create } from 'zustand'
import type { Balance } from '../../domain/settlement/Balance'
import type { Event, EventId } from '../../domain/event/Event'
import type { Invoice } from '../../domain/invoice/Invoice'
import type { Person } from '../../domain/person/Person'
import { calculateBalances, suggestTransfers } from '../../domain/settlement/SettlementService'
import type { SettlementTransfer } from '../../domain/settlement/SettlementTransfer'
import { addInvoiceToEvent } from '../../application/use-cases/addInvoiceToEvent'
import { addPersonToEvent } from '../../application/use-cases/addPersonToEvent'
import { calculateSettlement } from '../../application/use-cases/calculateSettlement'
import { createEvent } from '../../application/use-cases/createEvent'
import { removeInvoiceFromEvent } from '../../application/use-cases/removeInvoiceFromEvent'
import { removePersonFromEvent } from '../../application/use-cases/removePersonFromEvent'
import { updateInvoiceInEvent } from '../../application/use-cases/updateInvoiceInEvent'
import { updatePersonInEvent } from '../../application/use-cases/updatePersonInEvent'
import type {
  AddInvoiceInput,
  AddPersonInput,
  CreateEventInput,
  RemoveInvoiceInput,
  RemovePersonInput,
  UpdateInvoiceInput,
  UpdatePersonInput,
} from '../../application/dto/eventDtos'
import { InMemoryEventRepository } from '../../infra/persistence/in-memory/InMemoryEventRepository'
import { InMemoryPersonRepository } from '../../infra/persistence/in-memory/InMemoryPersonRepository'
import { InMemoryInvoiceRepository } from '../../infra/persistence/in-memory/InMemoryInvoiceRepository'

const eventRepository = new InMemoryEventRepository()
const personRepository = new InMemoryPersonRepository(eventRepository)
const invoiceRepository = new InMemoryInvoiceRepository(eventRepository)
let demoSeeded = false

interface FairSplitState {
  events: Event[]
  selectedEventId?: EventId
  hasSeededDemo: boolean
  hydrate: () => Promise<void>
  seedDemoData: () => Promise<void>
  selectEvent: (eventId: EventId) => void
  createEvent: (input: CreateEventInput) => Promise<Event>
  addPerson: (input: Omit<AddPersonInput, 'eventId'>) => Promise<Event | undefined>
  updatePerson: (
    input: Omit<UpdatePersonInput, 'eventId'>,
  ) => Promise<Event | undefined>
  removePerson: (
    input: Omit<RemovePersonInput, 'eventId'>,
  ) => Promise<Event | undefined>
  addInvoice: (
    input: Omit<AddInvoiceInput, 'eventId'>,
  ) => Promise<Event | undefined>
  updateInvoice: (
    input: Omit<UpdateInvoiceInput, 'eventId'>,
  ) => Promise<Event | undefined>
  removeInvoice: (
    input: Omit<RemoveInvoiceInput, 'eventId'>,
  ) => Promise<Event | undefined>
  getSelectedEvent: () => Event | undefined
  getBalances: () => Balance[]
  getTransfers: () => SettlementTransfer[]
  getSettlement: () => Promise<{
    balances: Balance[]
    transfers: SettlementTransfer[]
  } | null>
}

export const useFairSplitStore = create<FairSplitState>((set, get) => ({
  events: [],
  selectedEventId: undefined,
  hasSeededDemo: false,
  hydrate: async () => {
    const events = await eventRepository.list()
    set({
      events,
      selectedEventId: get().selectedEventId ?? events[0]?.id,
    })
  },
  seedDemoData: async () => {
    if (demoSeeded || get().hasSeededDemo) return
    demoSeeded = true

    const current = await eventRepository.list()
    if (current.length > 0) {
      set({ hasSeededDemo: true })
      return
    }

    const event = await createEvent(eventRepository, {
      name: 'Salida demo',
      currency: 'USD',
    })

    await addPersonToEvent(eventRepository, personRepository, {
      eventId: event.id,
      name: 'Ana',
    })
    await addPersonToEvent(eventRepository, personRepository, {
      eventId: event.id,
      name: 'Ben',
    })
    await addPersonToEvent(eventRepository, personRepository, {
      eventId: event.id,
      name: 'Carla',
    })

    const loaded = await eventRepository.getById(event.id)
    if (!loaded) return

    await addInvoiceToEvent(eventRepository, invoiceRepository, {
      eventId: loaded.id,
      description: 'Cena',
      amount: 90,
      payerId: loaded.people[0].id,
      participantIds: loaded.people.map((p) => p.id),
    })

    const finalEvent = await eventRepository.getById(event.id)
    if (!finalEvent) return

    set((_) => ({
      events: [finalEvent],
      selectedEventId: finalEvent.id,
      hasSeededDemo: true,
    }))
  },
  selectEvent: (eventId: EventId) => {
    set({ selectedEventId: eventId })
  },
  createEvent: async (input) => {
    const created = await createEvent(eventRepository, input)
    const events = await eventRepository.list()
    set({
      events,
      selectedEventId: created.id,
    })
    return created
  },
  addPerson: async (input) => {
    const eventId = get().selectedEventId
    if (!eventId) return undefined
    const event = await addPersonToEvent(
      eventRepository,
      personRepository,
      {
        ...input,
        eventId,
      },
    )
    if (!event) return undefined
    set((state) => ({
      events: state.events.map((item) =>
        item.id === event.id ? event : item,
      ),
    }))
    return event
  },
  updatePerson: async (input) => {
    const eventId = get().selectedEventId
    if (!eventId) return undefined
    const event = await updatePersonInEvent(
      eventRepository,
      personRepository,
      {
        ...input,
        eventId,
      },
    )
    if (!event) return undefined
    set((state) => ({
      events: state.events.map((item) =>
        item.id === event.id ? event : item,
      ),
    }))
    return event
  },
  removePerson: async (input) => {
    const eventId = get().selectedEventId
    if (!eventId) return undefined
    const event = await removePersonFromEvent(
      eventRepository,
      {
        ...input,
        eventId,
      },
    )
    if (!event) return undefined
    set((state) => ({
      events: state.events.map((item) =>
        item.id === event.id ? event : item,
      ),
    }))
    return event
  },
  addInvoice: async (input) => {
    const eventId = get().selectedEventId
    if (!eventId) return undefined
    const event = await addInvoiceToEvent(
      eventRepository,
      invoiceRepository,
      {
        ...input,
        eventId,
      },
    )
    if (!event) return undefined
    set((state) => ({
      events: state.events.map((item) =>
        item.id === event.id ? event : item,
      ),
    }))
    return event
  },
  updateInvoice: async (input) => {
    const eventId = get().selectedEventId
    if (!eventId) return undefined
    const event = await updateInvoiceInEvent(
      eventRepository,
      invoiceRepository,
      {
        ...input,
        eventId,
      },
    )
    if (!event) return undefined
    set((state) => ({
      events: state.events.map((item) =>
        item.id === event.id ? event : item,
      ),
    }))
    return event
  },
  removeInvoice: async (input) => {
    const eventId = get().selectedEventId
    if (!eventId) return undefined
    const event = await removeInvoiceFromEvent(
      eventRepository,
      invoiceRepository,
      {
        ...input,
        eventId,
      },
    )
    if (!event) return undefined
    set((state) => ({
      events: state.events.map((item) =>
        item.id === event.id ? event : item,
      ),
    }))
    return event
  },
  getSelectedEvent: () => {
    const { events, selectedEventId } = get()
    return events.find((event) => event.id === selectedEventId)
  },
  getBalances: () => {
    const event = get().getSelectedEvent()
    return event ? calculateBalances(event) : []
  },
  getTransfers: () => {
    const balances = get().getBalances()
    return suggestTransfers(balances)
  },
  getSettlement: async () => {
    const eventId = get().selectedEventId
    if (!eventId) return null
    return calculateSettlement(eventRepository, eventId)
  },
}))

export type EventForUI = Event
export type PersonForUI = Person
export type InvoiceForUI = Invoice
