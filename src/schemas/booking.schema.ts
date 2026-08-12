import { z } from 'zod';

export const identificationTypeEnum = z.enum([
  'FAYDA',
  'PASSPORT',
  'NATIONAL_ID',
  'DRIVERS_LICENSE',
  'OTHER',
]);

export const bookingFormSchema = z
  .object({
    carId: z.string().uuid('Please select a valid vehicle'),
    pickupLocation: z.string().min(1, 'Pickup location is required'),
    returnLocation: z.string().min(1, 'Return location is required'),
    pickupDate: z.string().min(1, 'Pickup date and time are required'),
    returnDate: z.string().min(1, 'Return date and time are required'),
    customerName: z.string().min(2, 'Full name must be at least 2 characters'),
    customerPhone: z.string().min(6, 'Valid phone number is required (e.g. +251911223344)'),
    customerEmail: z
      .string()
      .email('Please enter a valid email address')
      .optional()
      .or(z.literal('')),
    identificationType: identificationTypeEnum,
    identificationNumber: z.string().min(1, 'ID / Document number is required'),
  })
  .superRefine((data, ctx) => {
    const pickup = new Date(data.pickupDate);
    const ret = new Date(data.returnDate);

    if (isNaN(pickup.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid pickup date format',
        path: ['pickupDate'],
      });
      return;
    }

    if (isNaN(ret.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid return date format',
        path: ['returnDate'],
      });
      return;
    }

    if (ret <= pickup) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Return date must be after pickup date',
        path: ['returnDate'],
      });
    }
  });

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
