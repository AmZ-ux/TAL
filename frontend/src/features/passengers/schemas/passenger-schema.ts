import { z } from 'zod';

export const passengerPersonalSchema = z.object({
  fullName: z.string().min(2, 'Name must have at least 2 characters.'),
  phone: z.string().min(8, 'Phone is required.'),
  email: z
    .string()
    .email('Invalid email address.')
    .optional()
    .or(z.literal('')),
});

export const passengerAcademicSchema = z.object({
  institutionId: z.string().uuid('Select a valid institution.'),
  course: z.string().min(2, 'Course is required.'),
  shift: z.string().min(2, 'Shift is required.'),
});

export const passengerComplementarySchema = z.object({
  boardingPoint: z.string().min(2, 'Boarding point is required.'),
  notes: z
    .string()
    .max(500, 'Notes can contain up to 500 characters.')
    .optional()
    .or(z.literal('')),
  status: z.enum(['PAID', 'PENDING', 'OVERDUE']),
});

export const passengerFormSchema = passengerPersonalSchema
  .merge(passengerAcademicSchema)
  .merge(passengerComplementarySchema);

export type PassengerFormSchema = z.infer<typeof passengerFormSchema>;
