import { Request, Response, NextFunction } from 'express';
import { SanitizeUtil } from '../utils/sanitize.util';

/**
 * Middleware to sanitize request body
 */
export const sanitizeBody = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    req.body = SanitizeUtil.sanitizeObject(req.body);
  }
  next();
};

/**
 * Middleware to sanitize query parameters
 */
export const sanitizeQuery = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.query && typeof req.query === 'object') {
    // Sanitize in-place instead of reassigning
    for (const key in req.query) {
      const value = req.query[key];
      if (typeof value === 'string') {
        (req.query as any)[key] = SanitizeUtil.sanitizeString(value);
      }
    }
  }
  next();
};

/**
 * Middleware to sanitize params
 */
export const sanitizeParams = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.params && typeof req.params === 'object') {
    // Sanitize in-place instead of reassigning
    for (const key in req.params) {
      const value = req.params[key];
      if (typeof value === 'string') {
        req.params[key] = SanitizeUtil.sanitizeString(value);
      }
    }
  }
  next();
};

/**
 * Combined sanitization middleware
 */
export const sanitizeAll = (req: Request, res: Response, next: NextFunction): void => {
  sanitizeBody(req, res, () => {
    sanitizeQuery(req, res, () => {
      sanitizeParams(req, res, next);
    });
  });
};
