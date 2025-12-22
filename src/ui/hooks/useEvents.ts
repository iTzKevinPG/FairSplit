import { useCallback } from 'react'
import type { CreateEventInput } from '../../application/dto/eventDtos'
import { useFairSplitStore } from '../../shared/state/fairsplitStore'

export function useEvents() {
  const { events, selectedEventId, hydrate, selectEvent, createEvent } =
    useFairSplitStore()

  const loadEvents = useCallback(async () => {
    await hydrate()
  }, [hydrate])

  const createAndSelect = useCallback(
    async (input: CreateEventInput) => {
      const event = await createEvent(input)
      if (!event) return undefined
      selectEvent(event.id)
      return event
    },
    [createEvent, selectEvent],
  )

  return {
    events,
    selectedEventId,
    loadEvents,
    selectEvent,
    createAndSelect,
  }
}
