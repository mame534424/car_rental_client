import { apiRequest } from '../client';
import { Car } from '@/types/car';
import { CarInput } from '@/types/admin';

/** GET /admin/cars — all cars regardless of status (admin view). */
export async function adminListCars(): Promise<Car[]> {
  return apiRequest<Car[]>('/admin/cars', { method: 'GET' });
}

/** POST /admin/cars */
export async function createCar(input: CarInput): Promise<Car> {
  return apiRequest<Car>('/admin/cars', { method: 'POST', json: input });
}

/** PATCH /admin/cars/:id */
export async function updateCar(id: string, input: Partial<CarInput>): Promise<Car> {
  return apiRequest<Car>(`/admin/cars/${id}`, { method: 'PATCH', json: input });
}

/** DELETE /admin/cars/:id — 409 if the car has active bookings. */
export async function deleteCar(id: string): Promise<void> {
  await apiRequest<null>(`/admin/cars/${id}`, { method: 'DELETE' });
}
