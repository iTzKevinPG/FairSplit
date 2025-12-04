import { API_BASE_URL } from '../../config/api';

export type ApiInvoice = {
  id: string;
  description: string;
  amount: number;
  payerId: string;
  participantIds: string[];
  divisionMethod: 'equal' | 'consumption';
  tipAmount?: number;
  birthdayPersonId?: string;
};

type CreateInvoicePayload = {
  description: string;
  totalAmount: number;
  payerId: string;
  participantIds: string[];
  divisionMethod: 'equal' | 'consumption';
  consumptions?: Record<string, number>;
  tipAmount?: number;
  birthdayPersonId?: string;
};

function buildHeaders() {
  return {
    'Content-Type': 'application/json'
  };
}

export async function createInvoiceApi(
  eventId: string,
  payload: CreateInvoicePayload
): Promise<ApiInvoice> {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/invoices`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      // ignore
    }
    const message =
      details &&
      typeof details === 'object' &&
      details !== null &&
      'message' in details &&
      typeof (details as Record<string, unknown>).message === 'string'
        ? (details as Record<string, string>).message
        : 'Failed to create invoice';
    throw new Error(message);
  }

  return response.json();
}

export type ApiInvoiceListItem = {
  id: string;
  description: string;
  totalAmount: number;
  payerId: string;
  payerName: string;
  participantsCount: number;
  divisionMethod: 'equal' | 'consumption';
  tipAmount?: number;
  birthdayPersonId?: string;
};

export type ApiInvoiceDetail = {
  id: string;
  eventId: string;
  description: string;
  totalAmount: number;
  divisionMethod: 'equal' | 'consumption';
  payerId: string;
  payerName: string;
  tipAmount?: number;
  birthdayPersonId?: string;
  participations: Array<{
    participantId: string;
    participantName: string;
    amountAssigned: number;
    baseAmount: number;
    tipShare: number;
    isBirthdayPerson: boolean;
  }>;
};

export async function listInvoicesApi(eventId: string): Promise<ApiInvoiceListItem[]> {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/invoices`, {
    method: 'GET',
    headers: buildHeaders()
  });
  if (response.status === 404) {
    throw new Error('Event not found');
  }
  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }
  return response.json();
}

export async function getInvoiceApi(
  eventId: string,
  invoiceId: string
): Promise<ApiInvoiceDetail> {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/invoices/${invoiceId}`, {
    method: 'GET',
    headers: buildHeaders()
  });
  if (response.status === 404) {
    throw new Error('Invoice not found');
  }
  if (!response.ok) {
    throw new Error('Failed to fetch invoice');
  }
  return response.json();
}
