export type CarStatus = 'AVAILABLE' | 'MAINTENANCE' | 'UNAVAILABLE';

export interface Car {
  id: string;
  brand: string;
  model: string;
  description?: string | null;
  imageUrl?: string | null;
  quantity: number;
  pricePerDay: number | string;
  status: CarStatus;
  createdAt: string;
  updatedAt: string;
  availableUnits?: number;
}

export interface CarAvailabilityQuery {
  pickupDate?: string;
  returnDate?: string;
}
