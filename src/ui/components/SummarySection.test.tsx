import { render, screen } from '@testing-library/react'
import { SummarySection } from './SummarySection'

const people = [
  { id: 'p1', name: 'Ana' },
  { id: 'p2', name: 'Ben' },
]

describe('SummarySection', () => {
  it('renders balances with normalization near zero', () => {
    render(
      <SummarySection
        balances={[
          { personId: 'p1', totalPaid: 10, totalOwed: 10.01, net: -0.009 },
          { personId: 'p2', totalPaid: 0, totalOwed: 0, net: 0 },
        ]}
        people={people}
        currency="USD"
        tipTotal={5}
      />,
    )

    expect(screen.getByText(/Ana/)).toBeInTheDocument()
    expect(screen.getAllByText(/USD 0.00/).length).toBeGreaterThan(0)
  })

  it('shows positive and negative cues', () => {
    render(
      <SummarySection
        balances={[
          { personId: 'p1', totalPaid: 50, totalOwed: 10, net: 40 },
          { personId: 'p2', totalPaid: 0, totalOwed: 20, net: -20 },
        ]}
        people={people}
        currency="USD"
      />,
    )

    expect(screen.getByText(/⬆ USD 40.00/)).toBeInTheDocument()
    expect(screen.getByText(/⬇ USD -20.00/)).toBeInTheDocument()
  })
})
