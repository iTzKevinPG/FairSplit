import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InvoiceSection } from './InvoiceSection'

const baseProps = {
  invoices: [],
  people: [
    { id: 'p1', name: 'Ana' },
    { id: 'p2', name: 'Ben' },
  ],
  currency: 'USD',
  onAdd: vi.fn(),
  onUpdate: vi.fn(),
  onRemove: vi.fn(),
}

describe('InvoiceSection', () => {
  it('shows error when amount is invalid', async () => {
    const onAdd = vi.fn()
    render(<InvoiceSection {...baseProps} onAdd={onAdd} />)

    await userEvent.type(
      screen.getByPlaceholderText(/concepto del gasto/i),
      'Cena',
    )
    await userEvent.clear(screen.getByPlaceholderText(/monto/i))
    await userEvent.type(screen.getByPlaceholderText(/monto/i), '0')
    await userEvent.click(screen.getByRole('button', { name: /guardar gasto/i }))

    expect(
      await screen.findByText(/monto debe ser mayor que 0/i),
    ).toBeInTheDocument()
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('shows error when no payer', async () => {
    const onAdd = vi.fn()
    render(<InvoiceSection {...baseProps} onAdd={onAdd} />)

    await userEvent.type(
      screen.getByPlaceholderText(/concepto del gasto/i),
      'Cena',
    )
    await userEvent.clear(screen.getByPlaceholderText(/monto/i))
    await userEvent.type(screen.getByPlaceholderText(/monto/i), '50')
    // force payer to be undefined
    await userEvent.selectOptions(
      screen.getAllByRole('combobox')[0] as HTMLSelectElement,
      '',
    )
    await userEvent.click(screen.getByRole('button', { name: /guardar gasto/i }))

    expect(
      await screen.findByText(/seleccionar un pagador/i),
    ).toBeInTheDocument()
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('disables save when no participants exist', async () => {
    const onAdd = vi.fn()
    render(
      <InvoiceSection
        {...baseProps}
        people={[]}
        onAdd={onAdd}
      />,
    )

    expect(screen.getByRole('button', { name: /guardar gasto/i })).toBeDisabled()
  })

  it('shows error when consumptions are zero in consumption mode', async () => {
    const onAdd = vi.fn()
    render(<InvoiceSection {...baseProps} onAdd={onAdd} />)

    await userEvent.type(
      screen.getByPlaceholderText(/concepto del gasto/i),
      'Cena',
    )
    await userEvent.clear(screen.getByPlaceholderText(/monto/i))
    await userEvent.type(screen.getByPlaceholderText(/monto/i), '50')
    await userEvent.selectOptions(screen.getAllByRole('combobox')[1], 'Por consumo real')
    await userEvent.click(screen.getByRole('button', { name: /guardar gasto/i }))

    expect(await screen.findByText(/consumos mayores a 0/i)).toBeInTheDocument()
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('shows error when consumptions do not match total', async () => {
    const onAdd = vi.fn()
    render(<InvoiceSection {...baseProps} onAdd={onAdd} />)

    await userEvent.type(
      screen.getByPlaceholderText(/concepto del gasto/i),
      'Cena',
    )
    await userEvent.clear(screen.getByPlaceholderText(/monto/i))
    await userEvent.type(screen.getByPlaceholderText(/monto/i), '50')
    await userEvent.selectOptions(screen.getAllByRole('combobox')[1], 'Por consumo real')
    const consumptionAna = screen.getByTestId('consumption-p1')
    const consumptionBen = screen.getByTestId('consumption-p2')
    await userEvent.clear(consumptionAna)
    await userEvent.type(consumptionAna, '10')
    await userEvent.clear(consumptionBen)
    await userEvent.type(consumptionBen, '5')

    await userEvent.click(screen.getByRole('button', { name: /guardar gasto/i }))
    expect(
      await screen.findByText(/suma de consumos no coincide/i),
    ).toBeInTheDocument()
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('validates special guest needs another participant', async () => {
    const onAdd = vi.fn()
    render(<InvoiceSection {...baseProps} onAdd={onAdd} />)

    await userEvent.type(screen.getByPlaceholderText(/concepto del gasto/i), 'Cumple')
    const amountInput = screen.getByPlaceholderText(/monto/i)
    await userEvent.clear(amountInput)
    await userEvent.type(amountInput, '40')

    await userEvent.click(screen.getByLabelText(/invitado especial/i))
    await userEvent.selectOptions(
      screen.getByLabelText('Selecciona invitado especial', { selector: 'select' }),
      'p1',
    )

    await userEvent.click(screen.getByLabelText(/Ben/))

    await userEvent.click(screen.getByRole('button', { name: /guardar gasto/i }))
    expect(
      await screen.findByText(/se necesita al menos otra persona/i),
    ).toBeInTheDocument()
    expect(onAdd).not.toHaveBeenCalled()
  })
})
