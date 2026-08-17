import { apiRequest } from './client';

/**
 * POST /api/payments/submit-receipt
 * multipart/form-data: bookingId, receipt(file)
 */
export async function submitReceipt(bookingId: string, receiptFile: File) {
  const form = new FormData();
  form.append('bookingId', bookingId);
  form.append('receipt', receiptFile);

  return apiRequest('/payments/submit-receipt', {
    method: 'POST',
    form,
  });
}

// NOTE: The old checkout/verify mock endpoints were removed in favor of
// manual receipt submission. The server accepts receipt uploads and moves
// bookings to PENDING_VERIFICATION for admin approval.
