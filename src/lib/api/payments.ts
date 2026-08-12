import { CheckoutResponse, VerifyPaymentResponse } from '@/types/payment';
import { apiRequest } from './client';

export async function createCheckout(bookingId: string): Promise<CheckoutResponse> {
  return apiRequest<CheckoutResponse>('/payments/checkout', {
    method: 'POST',
    json: { bookingId },
  });
}

export async function verifyPayment(transactionReference: string): Promise<VerifyPaymentResponse> {
  return apiRequest<VerifyPaymentResponse>(`/payments/verify/${encodeURIComponent(transactionReference)}`, {
    method: 'POST',
  });
}
