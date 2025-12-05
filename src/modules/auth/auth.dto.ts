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
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD format'),
  phoneNumber: z.string().regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
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

// Request OTP DTO
export const requestOtpDto = z.object({
  phoneNumber: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Invalid Indonesian phone number format'),
});

export type RequestOtpDto = z.infer<typeof requestOtpDto>;

// Verify OTP DTO
export const verifyOtpDto = z.object({
  phoneNumber: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Invalid Indonesian phone number format'),
  code: z.string().length(6, 'OTP code must be 6 digits'),
});

export type VerifyOtpDto = z.infer<typeof verifyOtpDto>;
