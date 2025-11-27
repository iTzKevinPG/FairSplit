import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the FairSplit headline', async () => {
    render(<App />)
    expect(
      await screen.findByText('Divide gastos entre amigos con claridad.'),
    ).toBeInTheDocument()
  })
})
