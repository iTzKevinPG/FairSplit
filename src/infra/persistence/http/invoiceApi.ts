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
