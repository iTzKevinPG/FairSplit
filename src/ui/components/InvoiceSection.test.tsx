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
  onRemove: vi.fn(),
}

describe('InvoiceSection', () => {
  it('shows error when amount is invalid', async () => {
    const onAdd = vi.fn()
    render(<InvoiceSection {...baseProps} onAdd={onAdd} />)

    await userEvent.type(
      screen.getByPlaceholderText(/descripcion/i),
      'Cena',
    )
    await userEvent.clear(screen.getByPlaceholderText(/monto/i))
    await userEvent.type(screen.getByPlaceholderText(/monto/i), '0')
    await userEvent.click(screen.getByRole('button', { name: /guardar factura/i }))

    expect(
      await screen.findByText(/monto debe ser mayor que 0/i),
    ).toBeInTheDocument()
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('shows error when no payer', async () => {
    const onAdd = vi.fn()
    render(<InvoiceSection {...baseProps} onAdd={onAdd} />)

    await userEvent.type(
      screen.getByPlaceholderText(/descripcion/i),
      'Cena',
    )
    await userEvent.clear(screen.getByPlaceholderText(/monto/i))
    await userEvent.type(screen.getByPlaceholderText(/monto/i), '50')
    // force payer to be undefined
    await userEvent.selectOptions(
      screen.getAllByRole('combobox')[0] as HTMLSelectElement,
      '',
    )
    await userEvent.click(screen.getByRole('button', { name: /guardar factura/i }))

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

    expect(screen.getByRole('button', { name: /guardar factura/i })).toBeDisabled()
  })
})
