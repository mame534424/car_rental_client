import { apiRequest } from '../client';
import { Booking, BookingStatus } from '@/types/booking';
import { ManualBookingInput, TodaysRentals } from '@/types/admin';

/** GET /admin/bookings — all bookings, newest first, optional status filter. */
export async function adminListBookings(status?: BookingStatus): Promise<Booking[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  return apiRequest<Booking[]>(`/admin/bookings${qs}`, { method: 'GET' });
}

/** GET /admin/bookings/today — CONFIRMED pickups & returns due today. */
export async function getTodaysRentals(): Promise<TodaysRentals> {
  return apiRequest<TodaysRentals>('/admin/bookings/today', { method: 'GET' });
}

/** GET /admin/bookings/:id — full booking incl. customer, payments, signed ID URL. */
export async function getAdminBooking(id: string): Promise<Booking> {
  return apiRequest<Booking>(`/admin/bookings/${id}`, { method: 'GET' });
}

/** POST /admin/bookings/manual — create a walk-in booking. */
export async function createManualBooking(input: ManualBookingInput): Promise<Booking> {
  return apiRequest<Booking>('/admin/bookings/manual', {
    method: 'POST',
    json: {
      ...input,
      pickupDate: new Date(input.pickupDate).toISOString(),
      returnDate: new Date(input.returnDate).toISOString(),
    },
  });
}

/** PATCH /admin/bookings/:id/approve — PENDING_VERIFICATION -> CONFIRMED. */
export async function approveBooking(id: string): Promise<Booking> {
  return apiRequest<Booking>(`/admin/bookings/${id}/approve`, { method: 'PATCH' });
}

/** PATCH /admin/bookings/:id/reject — with optional reason. */
export async function rejectBooking(id: string, reason?: string): Promise<Booking> {
  return apiRequest<Booking>(`/admin/bookings/${id}/reject`, {
    method: 'PATCH',
    json: { reason: reason || undefined },
  });
}

/** PATCH /admin/bookings/:id/cancel */
export async function cancelBooking(id: string): Promise<Booking> {
  return apiRequest<Booking>(`/admin/bookings/${id}/cancel`, { method: 'PATCH' });
}

/** PATCH /admin/bookings/:id/complete — CONFIRMED -> COMPLETED. */
export async function completeBooking(id: string): Promise<Booking> {
  return apiRequest<Booking>(`/admin/bookings/${id}/complete`, { method: 'PATCH' });
}
