import type { PersonId } from '../person/Person'

export interface Participation {
  personId: PersonId
  amountAssigned: number
}
