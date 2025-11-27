import type { PersonId } from '../person/Person'

export interface Balance {
  personId: PersonId
  totalPaid: number
  totalOwed: number
  net: number
}
