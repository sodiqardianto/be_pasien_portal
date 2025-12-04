import { z } from 'zod';

// Register DTO
export const registerDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dob: z.string().datetime().optional(),
  phoneNumber: z.string().regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format').optional(),
});

export type RegisterDto = z.infer<typeof registerDto>;

// Login DTO
export const loginDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof loginDto>;

// Refresh Token DTO
export const refreshTokenDto = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenDto = z.infer<typeof refreshTokenDto>;
