import { API_BASE_URL } from '../../config/api';

export type ApiSummaryItem = {
  participantId: string;
  participantName: string;
  totalPaid: number;
  totalShouldPay: number;
  netBalance: number;
  status: 'creditor' | 'debtor' | 'settled';
};

export async function getSummaryApi(eventId: string): Promise<ApiSummaryItem[]> {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/summary`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (response.status === 404) {
    throw new Error('Event not found');
  }
  if (!response.ok) {
    throw new Error('Failed to fetch summary');
  }
  return response.json();
}

export type ApiTransferItem = {
  fromParticipantId: string;
  fromName: string;
  toParticipantId: string;
  toName: string;
  amount: number;
};

export async function getTransfersApi(eventId: string): Promise<ApiTransferItem[]> {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/transfers`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (response.status === 404) {
    throw new Error('Event not found');
  }
  if (!response.ok) {
    throw new Error('Failed to fetch transfers');
  }
  return response.json();
}
