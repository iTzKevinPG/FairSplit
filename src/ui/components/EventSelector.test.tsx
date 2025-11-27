import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { EventSelector } from './EventSelector'

describe('EventSelector', () => {
  const baseProps = {
    events: [],
    selectedEventId: undefined,
    onSelect: vi.fn(),
    onCreate: vi.fn(),
  }

  it('blocks creation when name is empty and shows error', async () => {
    const onCreate = vi.fn()
    render(
      <EventSelector
        {...baseProps}
        onCreate={onCreate}
      />,
    )

    const submit = screen.getByRole('button', { name: /crear evento/i })
    await userEvent.click(submit)

    expect(onCreate).not.toHaveBeenCalled()
    expect(
      await screen.findByText(/el nombre del evento es obligatorio/i),
    ).toBeInTheDocument()
  })

  it('creates event when name and currency are provided', async () => {
    const onCreate = vi.fn()
    render(
      <EventSelector
        {...baseProps}
        onCreate={onCreate}
      />,
    )

    await userEvent.type(
      screen.getByPlaceholderText(/nombre del evento/i),
      'Viaje',
    )
    await userEvent.selectOptions(screen.getByDisplayValue('COP'), 'USD')

    await userEvent.click(screen.getByRole('button', { name: /crear evento/i }))

    expect(onCreate).toHaveBeenCalledWith('Viaje', 'USD')
  })
})
