import { prisma } from '../../shared/utils/prisma.util';
import { PasswordUtil } from '../../shared/utils/password.util';
import { JwtUtil } from '../../shared/utils/jwt.util';
import { AuthTokens } from '../../shared/types';
import { RegisterDto, LoginDto } from './auth.dto';
import { UserResponse } from './auth.types';

export class AuthService {
  static async register(data: RegisterDto): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email, deletedAt: null },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await PasswordUtil.hash(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        dob: data.dob ? new Date(data.dob) : null,
        phoneNumber: data.phoneNumber,
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
      dob: user.dob,
      phoneNumber: user.phoneNumber,
      role: user.role,
      createdAt: user.createdAt,
    };

    return { user: userResponse, tokens };
  }

  static async login(data: LoginDto): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    const user = await prisma.user.findUnique({
      where: { email: data.email, deletedAt: null },
    });

    if (!user || user.deletedAt) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await PasswordUtil.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
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
      dob: user.dob,
      phoneNumber: user.phoneNumber,
      role: user.role,
      createdAt: user.createdAt,
    };

    return { user: userResponse, tokens };
  }

  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const decoded = JwtUtil.verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId, deletedAt: null },
    });

    if (!user || user.refreshToken !== refreshToken || user.deletedAt) {
      throw new Error('Invalid refresh token');
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

    return tokens;
  }

  static async logout(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId, deletedAt: null },
      data: { refreshToken: null },
    });
  }

  static async getProfile(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        dob: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
