import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ResponseHandler } from '../utils/response.util';

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (result.success) {
      return next();
    }

    const zodError = result.error;
    const groupedErrors: Record<string, string[]> = {};

    zodError.issues.forEach((issue) => {
      const fieldName = issue.path.length ? issue.path.join('.') : 'general';
      if (!groupedErrors[fieldName]) groupedErrors[fieldName] = [];
      if (!groupedErrors[fieldName].includes(issue.message)) {
        groupedErrors[fieldName].push(issue.message);
      }
    });

    return ResponseHandler.validationError(res, 'Validation failed', groupedErrors, 400);
  };
};
