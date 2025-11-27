import { render, screen } from '@testing-library/react'
import { TransfersSection } from './TransfersSection'

const people = [
  { id: 'p1', name: 'Ana' },
  { id: 'p2', name: 'Ben' },
]

describe('TransfersSection', () => {
  it('shows empty state when no transfers', () => {
    render(
      <TransfersSection transfers={[]} people={people} currency="USD" />,
    )

    expect(
      screen.getByText(/no hay deudas pendientes/i),
    ).toBeInTheDocument()
  })

  it('renders transfers table', () => {
    render(
      <TransfersSection
        transfers={[
          { fromPersonId: 'p1', toPersonId: 'p2', amount: 10 },
        ]}
        people={people}
        currency="USD"
      />,
    )

    expect(screen.getByText(/Ana/)).toBeInTheDocument()
    expect(screen.getByText(/Ben/)).toBeInTheDocument()
    expect(screen.getByText(/USD 10.00/)).toBeInTheDocument()
  })
})
