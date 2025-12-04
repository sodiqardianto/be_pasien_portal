import { z } from 'zod';

// Create Hospital DTO
export const createHospitalDto = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  image: z.string().url('Invalid image URL').optional(),
  phone: z.string().regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  email: z.string().email('Invalid email format'),
  website: z.string().url('Invalid website URL').optional(),
});

export type CreateHospitalDto = z.infer<typeof createHospitalDto>;

// Update Hospital DTO
export const updateHospitalDto = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  image: z.string().url().optional(),
  phone: z.string().regex(/^[0-9+\-\s()]+$/).optional(),
  address: z.string().min(10).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
});

export type UpdateHospitalDto = z.infer<typeof updateHospitalDto>;
