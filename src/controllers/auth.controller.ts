import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { PasswordUtil } from '../utils/password';
import { JwtUtil } from '../utils/jwt';
import { ResponseHandler } from '../utils/response';
import { UserResponse } from '../types/index';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { email, password, name } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return ResponseHandler.error(res, 'User already exists', 'Email is already registered', 409);
      }

      const hashedPassword = await PasswordUtil.hash(password);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });

      const tokens = JwtUtil.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      const userResponse: UserResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      };

      return ResponseHandler.created(res, 'User registered successfully', {
        user: userResponse,
        ...tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return ResponseHandler.error(res, 'Invalid credentials', 'Email or password is incorrect', 401);
      }

      const isPasswordValid = await PasswordUtil.compare(password, user.password);

      if (!isPasswordValid) {
        return ResponseHandler.error(res, 'Invalid credentials', 'Email or password is incorrect', 401);
      }

      const tokens = JwtUtil.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      const userResponse: UserResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      };

      return ResponseHandler.success(res, 'Login successful', {
        user: userResponse,
        ...tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { refreshToken } = req.body;

      const decoded = JwtUtil.verifyRefreshToken(refreshToken);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || user.refreshToken !== refreshToken) {
        return ResponseHandler.unauthorized(res, 'Invalid refresh token');
      }

      const tokens = JwtUtil.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return ResponseHandler.success(res, 'Token refreshed successfully', tokens);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseHandler.unauthorized(res, 'User not authenticated');
      }

      await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      });

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

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return ResponseHandler.notFound(res, 'User not found');
      }

      return ResponseHandler.success(res, 'Profile retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  }
}
