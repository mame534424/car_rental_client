import { Booking } from './booking';
import { CarStatus } from './car';
import { IdentificationType } from './booking';

export interface Admin {
  id: string;
  name: string;
  email: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

/** Payload for POST/PATCH /admin/cars — mirrors createCarSchema.body on the backend. */
export interface CarInput {
  brand: string;
  model: string;
  description?: string;
  imageUrl?: string;
  quantity: number;
  pricePerDay: number;
  status?: CarStatus;
}

export type ManualPaymentStatus = 'PENDING' | 'PAID';

/** Payload for POST /admin/bookings/manual — walk-in booking created by an admin. */
export interface ManualBookingInput {
  carId: string;
  pickupLocation: string;
  returnLocation: string;
  pickupDate: string; // ISO string
  returnDate: string; // ISO string
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  identificationType: IdentificationType;
  identificationNumber: string;
  paymentStatus?: ManualPaymentStatus; // defaults to PAID on the server
}

/** GET /admin/bookings/today — CONFIRMED bookings with pickup/return due today. */
export interface TodaysRentals {
  pickups: Booking[];
  returns: Booking[];
}
