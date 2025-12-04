import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../utils/response.util';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', err);

  if (err.name === 'PrismaClientKnownRequestError') {
    return ResponseHandler.error(res, 'Database error', err.message, 400);
  }

  if (err.name === 'JsonWebTokenError') {
    return ResponseHandler.unauthorized(res, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseHandler.unauthorized(res, 'Token expired');
  }

  return ResponseHandler.serverError(res, err.message || 'Something went wrong');
};

export const notFoundHandler = (req: Request, res: Response) => {
  return ResponseHandler.notFound(res, `Route ${req.originalUrl} not found`);
};
