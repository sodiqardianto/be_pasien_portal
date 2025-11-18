import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ResponseHandler } from '../utils/response';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Use safeParse so we don't need try/catch and we can always format errors
    const result = schema.safeParse(req.body);
    if (result.success) {
      return next();
    }

    const zodError = result.error;
    // Group errors by field name into a tidy object: { field: [messages] }
    const groupedErrors: Record<string, string[]> = {};

    zodError.issues.forEach((issue) => {
      const fieldName = issue.path.length ? issue.path.join('.') : 'general';
      if (!groupedErrors[fieldName]) groupedErrors[fieldName] = [];
      // Avoid duplicate messages for same field
      if (!groupedErrors[fieldName].includes(issue.message)) {
        groupedErrors[fieldName].push(issue.message);
      }
    });

    return ResponseHandler.validationError(res, 'Validation failed', groupedErrors, 400);
  };
};
