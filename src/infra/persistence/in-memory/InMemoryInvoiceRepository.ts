import type { Invoice, InvoiceId } from '../../../domain/invoice/Invoice'
import type { EventId } from '../../../domain/event/Event'
import type { InvoiceRepository } from '../../../application/ports/InvoiceRepository'
import type { EventRepository } from '../../../application/ports/EventRepository'

export class InMemoryInvoiceRepository implements InvoiceRepository {
  private readonly eventRepo: EventRepository

  constructor(eventRepo: EventRepository) {
    this.eventRepo = eventRepo
  }

  async listByEvent(eventId: EventId): Promise<Invoice[]> {
    const event = await this.eventRepo.getById(eventId)
    return event ? event.invoices.map(cloneInvoice) : []
  }

  async add(eventId: EventId, invoice: Invoice): Promise<void> {
    const event = await this.eventRepo.getById(eventId)
    if (!event) return
    const nextEvent = { ...event, invoices: [...event.invoices, cloneInvoice(invoice)] }
    await this.eventRepo.save(nextEvent)
  }

  async update(eventId: EventId, invoice: Invoice): Promise<void> {
    const event = await this.eventRepo.getById(eventId)
    if (!event) return
    const nextEvent = {
      ...event,
      invoices: event.invoices.map((item) =>
        item.id === invoice.id ? cloneInvoice(invoice) : item,
      ),
    }
    await this.eventRepo.save(nextEvent)
  }

  async remove(eventId: EventId, invoiceId: InvoiceId): Promise<void> {
    const event = await this.eventRepo.getById(eventId)
    if (!event) return
    const nextEvent = {
      ...event,
      invoices: event.invoices.filter((invoice) => invoice.id !== invoiceId),
    }
    await this.eventRepo.save(nextEvent)
  }
}

function cloneInvoice(invoice: Invoice): Invoice {
  return {
    ...invoice,
    participantIds: [...invoice.participantIds],
    items: invoice.items
      ? invoice.items.map((item) => ({
          ...item,
          participantIds: [...item.participantIds],
        }))
      : undefined,
  }
}
