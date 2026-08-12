import { Booking, CreateBookingInput } from '@/types/booking';
import { apiRequest } from './client';

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const formData = new FormData();

  formData.append('carId', input.carId);
  formData.append('pickupLocation', input.pickupLocation);
  formData.append('returnLocation', input.returnLocation);
  formData.append('pickupDate', new Date(input.pickupDate).toISOString());
  formData.append('returnDate', new Date(input.returnDate).toISOString());
  formData.append('customerName', input.customerName);
  formData.append('customerPhone', input.customerPhone);

  if (input.customerEmail) {
    formData.append('customerEmail', input.customerEmail);
  }

  formData.append('identificationType', input.identificationType);
  formData.append('identificationNumber', input.identificationNumber);

  if (input.identificationDocument) {
    formData.append('identificationDocument', input.identificationDocument);
  }

  return apiRequest<Booking>('/bookings', {
    method: 'POST',
    form: formData,
  });
}
