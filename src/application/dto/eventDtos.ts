import type { EventId } from '../../domain/event/Event'
import type { InvoiceId } from '../../domain/invoice/Invoice'
import type { PersonId } from '../../domain/person/Person'

export interface CreateEventInput {
  name: string
  currency: string
}

export interface AddPersonInput {
  eventId: EventId
  name: string
}

export interface UpdatePersonInput {
  eventId: EventId
  personId: PersonId
  name: string
}

export interface RemovePersonInput {
  eventId: EventId
  personId: PersonId
}

export interface AddInvoiceInput {
  eventId: EventId
  description: string
  amount: number
  payerId: PersonId
  participantIds: PersonId[]
  divisionMethod?: 'equal' | 'consumption'
  consumptions?: Record<PersonId, number>
  tipAmount?: number
  birthdayPersonId?: PersonId
}

export interface UpdateInvoiceInput extends AddInvoiceInput {
  invoiceId: InvoiceId
}

export interface RemoveInvoiceInput {
  eventId: EventId
  invoiceId: InvoiceId
}
