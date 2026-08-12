import { PaymentRecord } from './booking';

export interface CheckoutResponse {
  checkoutUrl: string;
  transactionReference: string;
}

export interface CheckoutInput {
  bookingId: string;
}

export interface VerifyPaymentResponse extends PaymentRecord {
  booking?: any;
}
