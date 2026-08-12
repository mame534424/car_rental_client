import { Car, CarAvailabilityQuery } from '@/types/car';
import { apiRequest } from './client';

export async function getCars(query?: CarAvailabilityQuery): Promise<Car[]> {
  const params = new URLSearchParams();

  if (query?.pickupDate) {
    params.set('pickupDate', new Date(query.pickupDate).toISOString());
  }
  if (query?.returnDate) {
    params.set('returnDate', new Date(query.returnDate).toISOString());
  }

  const queryString = params.toString();
  const endpoint = `/cars${queryString ? `?${queryString}` : ''}`;

  return apiRequest<Car[]>(endpoint, { method: 'GET' });
}

export async function getCarById(id: string): Promise<Car> {
  return apiRequest<Car>(`/cars/${id}`, { method: 'GET' });
}
