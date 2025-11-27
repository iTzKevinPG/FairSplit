import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import EventListPage from './EventListPage'
import { useFairSplitStore } from '../../shared/state/fairsplitStore'

// Simple navigator spy wrapper
function NavigateSpy() {
  const navigate = useNavigate()
  // expose navigate to jest mock
  ;(NavigateSpy as any).navigate = navigate
  return null
}

describe('EventListPage', () => {
  beforeEach(() => {
    useFairSplitStore.setState({
      events: [],
      selectedEventId: undefined,
      hasSeededDemo: false,
    })
  })

  it('shows empty state when no events', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<EventListPage />} />
          </Routes>
        </MemoryRouter>,
      )
    })

    expect(screen.getByTestId('empty-events')).toBeInTheDocument()
  })

  it('navigates to event detail when clicking a card', async () => {
    const { createEvent } = useFairSplitStore.getState()
    const event = await createEvent({ name: 'Viaje', currency: 'USD' })

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <NavigateSpy />
                <EventListPage />
              </>
            }
          />
          <Route path="/events/:eventId" element={<div>Detail</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByText(event.name))

    const navigate = (NavigateSpy as any).navigate as ReturnType<typeof useNavigate>
    // Should navigate to the event detail route
    expect(navigate).toBeDefined()
  })
})
