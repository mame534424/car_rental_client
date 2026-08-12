import { Car } from './car';

export type IdentificationType =
  | 'FAYDA'
  | 'PASSPORT'
  | 'NATIONAL_ID'
  | 'DRIVERS_LICENSE'
  | 'OTHER';

export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_VERIFICATION'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'REJECTED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export type BookingSource = 'ONLINE' | 'MANUAL';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  identificationType: IdentificationType;
  identificationNumber: string;
  identificationDocumentPath?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  customerId: string;
  carId: string;
  pickupLocation: string;
  returnLocation: string;
  pickupDate: string;
  returnDate: string;
  totalAmount: number | string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  source: BookingSource;
  createdAt: string;
  updatedAt: string;
  car?: Car;
  customer?: Customer;
  payments?: PaymentRecord[];
  documentSignedUrl?: string | null;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  amount: number | string;
  provider: string;
  status: PaymentStatus;
  transactionReference: string;
  checkoutUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingInput {
  carId: string;
  pickupLocation: string;
  returnLocation: string;
  pickupDate: string; // ISO String
  returnDate: string; // ISO String
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  identificationType: IdentificationType;
  identificationNumber: string;
  identificationDocument?: File | null;
}
