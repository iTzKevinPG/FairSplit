import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the FairSplit headline', () => {
    render(<App />)
    expect(
      screen.getByText('Divide gastos entre amigos sin dolores de cabeza.'),
    ).toBeInTheDocument()
  })
})
