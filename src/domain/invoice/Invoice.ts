import type { PersonId } from '../person/Person'

export type InvoiceId = string

export interface Invoice {
  id: InvoiceId
  description: string
  amount: number
  payerId: PersonId
  participantIds: PersonId[]
  divisionMethod?: 'equal' | 'consumption'
  consumptions?: Record<PersonId, number>
}
