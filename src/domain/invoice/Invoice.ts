import type { PersonId } from '../person/Person'

export type InvoiceId = string

export interface Invoice {
  id: InvoiceId
  description: string
  amount: number
  payerId: PersonId
  participantIds: PersonId[]
}
