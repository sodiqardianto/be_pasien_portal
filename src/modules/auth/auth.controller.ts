import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../../shared/utils/response.util';
import { AuthService } from './auth.service';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const result = await AuthService.register(req.body);

      return ResponseHandler.created(res, 'User registered successfully', {
        user: result.user,
        ...result.tokens,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Email already registered') {
          return ResponseHandler.error(res, 'Email already registered', 'This email is already in use', 409);
        }
        if (error.message === 'Phone number already registered') {
          return ResponseHandler.error(res, 'Phone number already registered', 'This phone number is already in use', 409);
        }
      }
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const result = await AuthService.login(req.body);

      return ResponseHandler.success(res, 'Login successful', {
        user: result.user,
        ...result.tokens,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid credentials') {
        return ResponseHandler.error(res, 'Invalid credentials', 'Email or password is incorrect', 401);
      }
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshToken(refreshToken);

      return ResponseHandler.success(res, 'Token refreshed successfully', tokens);
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid refresh token') {
        return ResponseHandler.unauthorized(res, 'Invalid refresh token');
      }
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseHandler.unauthorized(res, 'User not authenticated');
      }

      await AuthService.logout(userId);

      return ResponseHandler.success(res, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseHandler.unauthorized(res, 'User not authenticated');
      }

      const user = await AuthService.getProfile(userId);

      return ResponseHandler.success(res, 'Profile retrieved successfully', user);
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        return ResponseHandler.notFound(res, 'User not found');
      }
      next(error);
    }
  }

  static async requestOtp(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const result = await AuthService.requestOtp(req.body);

      return ResponseHandler.success(res, 'OTP sent successfully', {
        phoneNumber: req.body.phoneNumber,
        expiresIn: result.expiresIn,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Phone number not registered') {
          return ResponseHandler.error(res, 'Phone number not registered', 'Please register first before using OTP login', 404);
        }
        if (error.message === 'Too many OTP requests. Please try again later') {
          return ResponseHandler.error(res, 'Too many requests', error.message, 429);
        }
      }
      next(error);
    }
  }

  static async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const result = await AuthService.verifyOtp(req.body);

      return ResponseHandler.success(res, 'Login successful', {
        user: result.user,
        ...result.tokens,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Phone number not registered') {
          return ResponseHandler.error(res, 'Phone number not registered', 'Please register first before using OTP login', 404);
        }
        if (error.message === 'Invalid or expired OTP code') {
          return ResponseHandler.error(res, 'Invalid OTP', error.message, 400);
        }
        if (error.message === 'Too many failed attempts. Please request a new OTP') {
          return ResponseHandler.error(res, 'Too many attempts', error.message, 429);
        }
      }
      next(error);
    }
  }
}
