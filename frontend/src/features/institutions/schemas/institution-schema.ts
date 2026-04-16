import { z } from 'zod';

export const institutionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  notes: z
    .string()
    .max(500, 'Notes can contain up to 500 characters.')
    .optional()
    .or(z.literal('')),
});

export type InstitutionSchema = z.infer<typeof institutionSchema>;
