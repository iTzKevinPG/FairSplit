import type { PersonId } from '../person/Person'

export interface SettlementTransfer {
  fromPersonId: PersonId
  toPersonId: PersonId
  amount: number
}
