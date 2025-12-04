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
import {
  createEventApi,
  listEventsApi,
} from '../../infra/persistence/http/eventApi'
import {
  createParticipantApi,
  deleteParticipantApi,
  listParticipantsApi,
  updateParticipantApi,
} from '../../infra/persistence/http/participantApi'
import {
  createInvoiceApi,
  getInvoiceApi,
  listInvoicesApi,
} from '../../infra/persistence/http/invoiceApi'
import { getSummaryApi, getTransfersApi } from '../../infra/persistence/http/summaryApi'

const eventRepository = new InMemoryEventRepository()
const personRepository = new InMemoryPersonRepository(eventRepository)
const invoiceRepository = new InMemoryInvoiceRepository(eventRepository)
let demoSeeded = false
const loadedEventData = new Set<string>()

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
    // Fetch event headers only; load details lazily per event to reduce calls.
    try {
      const apiEvents = await listEventsApi()
      apiEvents.forEach((apiEvent) => {
        eventRepository.save({
          id: apiEvent.id,
          name: apiEvent.name,
          currency: apiEvent.currency,
          people: [],
          invoices: [],
        })
      })
    } catch (error) {
      console.warn('Falling back to local events; backend list failed', error)
    }

    const events = await eventRepository.list()
    const selected = get().selectedEventId ?? events[0]?.id
    set({
      events,
      selectedEventId: selected,
    })

    if (selected) {
      void loadEventData(selected, set, get)
    }
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

    set(() => ({
      events: [finalEvent],
      selectedEventId: finalEvent.id,
      hasSeededDemo: true,
    }))
  },
  selectEvent: (eventId: EventId) => {
    set({ selectedEventId: eventId })
    if (!loadedEventData.has(eventId)) {
      void loadEventData(eventId, set, get)
    }
  },
  createEvent: async (input) => {
    let backendId: string | undefined
    try {
      const response = await createEventApi({
        name: input.name,
        currency: input.currency,
      })
      backendId = response.id
    } catch (error) {
      console.error('Failed to persist event to backend, using local id', error)
    }

    const created = await createEvent(eventRepository, { ...input, id: backendId })
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
    let participantId: string | undefined
    try {
      const created = await createParticipantApi(eventId, { name: input.name })
      participantId = created.id
    } catch (error) {
      console.error('Failed to persist participant to backend, using local id', error)
    }

    const event = await addPersonToEvent(eventRepository, personRepository, {
      ...input,
      id: participantId,
      eventId,
    })
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
    try {
      await updateParticipantApi(eventId, input.personId, { name: input.name })
    } catch (error) {
      console.error('Failed to update participant in backend, applying local change', error)
    }
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
    try {
      await deleteParticipantApi(eventId, input.personId)
    } catch (error) {
      console.error('Failed to delete participant in backend, applying local change', error)
    }
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
    let invoiceId: string | undefined
    try {
      const created = await createInvoiceApi(eventId, {
        description: input.description,
        totalAmount: input.amount,
        payerId: input.payerId,
        participantIds: input.participantIds,
        divisionMethod: input.divisionMethod ?? 'equal',
        consumptions: input.consumptions,
        tipAmount: input.tipAmount,
        birthdayPersonId: input.birthdayPersonId,
      })
      invoiceId = created.id
    } catch (error) {
      console.error('Failed to persist invoice to backend, using local id', error)
    }

    const event = await addInvoiceToEvent(
      eventRepository,
      invoiceRepository,
      {
        id: invoiceId,
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
    const eventId = get().selectedEventId
    if (!eventId) return []
    const balances = get().getBalances()
    return suggestTransfers(balances)
  },
  getSettlement: async () => {
    const eventId = get().selectedEventId
    if (!eventId) return null
    try {
      const summaryPromise = getSummaryApi(eventId)
      const transfersPromise = getTransfersApi(eventId).catch(() => null)

      const [summary, transfers] = await Promise.all([summaryPromise, transfersPromise])
      const balances: Balance[] = summary.map((item) => ({
        personId: item.participantId,
        totalPaid: item.totalPaid,
        totalOwed: item.totalShouldPay,
        netBalance: item.netBalance,
      }))
      return {
        balances,
        transfers:
          transfers?.map((t) => ({
            fromId: t.fromParticipantId,
            toId: t.toParticipantId,
            amount: t.amount,
          })) ?? suggestTransfers(balances),
      }
    } catch (error) {
      console.error('Failed to fetch summary from backend, falling back to local calc', error)
      return calculateSettlement(eventRepository, eventId)
    }
  },
}))

async function loadEventData(
  eventId: EventId,
  setFn: Parameters<typeof useFairSplitStore>[0],
) {
  try {
    const [participants, invoices] = await Promise.all([
      listParticipantsApi(eventId).catch((error) => {
        console.warn(`Failed to fetch participants for event ${eventId}`, error)
        return null
      }),
      listInvoicesApi(eventId).catch((error) => {
        console.warn(`Failed to fetch invoices list for event ${eventId}`, error)
        return null
      }),
    ])

    const detailedInvoices =
      invoices !== null
        ? await Promise.all(
            invoices.map(async (inv) => {
              try {
                return await getInvoiceApi(eventId, inv.id)
              } catch (error) {
                console.warn(`Failed to fetch invoice ${inv.id} detail`, error)
                return null
              }
            }),
          )
        : null

    const existing = await eventRepository.getById(eventId)
    const current: Event = existing ?? {
      id: eventId,
      name: existing?.name ?? '',
      currency: existing?.currency ?? '',
      people: existing?.people ?? [],
      invoices: existing?.invoices ?? [],
    }

    const mappedParticipants =
      participants?.map((p) => ({ id: p.id, name: p.name })) ?? current.people

    const mappedInvoices =
      detailedInvoices
        ?.filter((d): d is NonNullable<typeof d> => Boolean(d))
        .map((det) => {
          const consumptions = det.participations.reduce<Record<string, number>>((acc, p) => {
            acc[p.participantId] = p.baseAmount
            return acc
          }, {})
          return {
            id: det.id,
            description: det.description,
            amount: det.totalAmount,
            payerId: det.payerId,
            participantIds: det.participations.map((p) => p.participantId),
            divisionMethod: det.divisionMethod,
            consumptions,
            tipAmount: det.tipAmount,
            birthdayPersonId: det.birthdayPersonId,
          }
        }) ?? current.invoices

    await eventRepository.save({
      ...current,
      people: mappedParticipants,
      invoices: mappedInvoices,
    })

    const events = await eventRepository.list()
    setFn((state: FairSplitState) => ({
      events,
      selectedEventId: state.selectedEventId ?? eventId,
    }))
    loadedEventData.add(eventId)
  } catch (error) {
    console.warn(`Failed to load event data for ${eventId}`, error)
  }
}

export type EventForUI = Event
export type PersonForUI = Person
export type InvoiceForUI = Invoice
