import type { Invoice, InvoiceId } from '../../domain/invoice/Invoice'
import type { EventId } from '../../domain/event/Event'

export interface InvoiceRepository {
  listByEvent(eventId: EventId): Promise<Invoice[]>
  add(eventId: EventId, invoice: Invoice): Promise<void>
  update(eventId: EventId, invoice: Invoice): Promise<void>
  remove(eventId: EventId, invoiceId: InvoiceId): Promise<void>
}
