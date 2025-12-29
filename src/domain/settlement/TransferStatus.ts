import type { PersonId } from '../person/Person'

export interface TransferStatus {
  eventId: string
  fromPersonId: PersonId
  toPersonId: PersonId
  isSettled: boolean
  settledAt?: string | null
}
