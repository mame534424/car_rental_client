import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const numeric = typeof amount === 'number' ? amount : parseFloat(amount || '0');
  if (isNaN(numeric)) return '0 ETB';
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function calculateRentalDays(pickupDate: string | Date, returnDate: string | Date): number {
  const pickup = new Date(pickupDate);
  const ret = new Date(returnDate);

  if (isNaN(pickup.getTime()) || isNaN(ret.getTime())) return 1;

  const diffTime = ret.getTime() - pickup.getTime();
  if (diffTime <= 0) return 1;

  // Calculate full calendar days or 24-hour periods
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(days, 1);
}

export function calculateTotalPrice(
  pricePerDay: number | string,
  pickupDate: string | Date,
  returnDate: string | Date
): number {
  const days = calculateRentalDays(pickupDate, returnDate);
  const price = typeof pricePerDay === 'number' ? pricePerDay : parseFloat(pricePerDay || '0');
  return Math.round(price * days * 100) / 100;
}

export function formatDate(dateString: string | Date, includeTime = false): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
}

export function getErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred';
  if (typeof error === 'string') return error;
  if (error.message) {
    if (error.details && typeof error.details === 'object') {
      const fieldErrors = Object.entries(error.details)
        .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
        .join(' | ');
      if (fieldErrors) return `${error.message} (${fieldErrors})`;
    }
    return error.message;
  }
  return 'Failed to complete request. Please try again.';
}
