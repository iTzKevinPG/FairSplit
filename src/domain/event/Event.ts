import type { Invoice } from '../invoice/Invoice'
import type { Person } from '../person/Person'

export type EventId = string

export interface Event {
  id: EventId
  name: string
  currency: string
  people: Person[]
  invoices: Invoice[]
  peopleCount?: number
  invoiceCount?: number
  isPublic?: boolean
}
