import { prisma, PasswordUtil, JwtUtil, formatDate, WhatsAppUtil } from '../../shared/utils';
import { AuthTokens } from '../../shared/types';
import { RegisterDto, LoginDto, RequestOtpDto, VerifyOtpDto } from './auth.dto';
import { UserResponse } from './auth.types';

export class AuthService {
  static async register(data: RegisterDto): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    // Normalize phone number
    const normalizedPhone = this.normalizePhoneNumber(data.phoneNumber);

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email, deletedAt: null },
    });

    if (existingEmail) {
      throw new Error('Email already registered');
    }

    // Check if phone number already exists
    const existingPhone = await prisma.user.findFirst({
      where: { phoneNumber: normalizedPhone, deletedAt: null },
    });

    if (existingPhone) {
      throw new Error('Phone number already registered');
    }

    const hashedPassword = await PasswordUtil.hash(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        dob: data.dob ? new Date(data.dob) : null,
        phoneNumber: normalizedPhone,
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
      dob: formatDate(user.dob),
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
      dob: formatDate(user.dob),
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

    return {
      ...user,
      dob: formatDate(user.dob),
    };
  }

  /**
   * Request OTP - Generate and send OTP code to phone number
   */
  static async requestOtp(data: RequestOtpDto): Promise<{ expiresIn: number }> {
    const { phoneNumber } = data;

    // Normalize phone number
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

    // Check if phone number is registered
    const existingUser = await prisma.user.findFirst({
      where: {
        phoneNumber: normalizedPhone,
        deletedAt: null,
      },
    });

    if (!existingUser) {
      throw new Error('Phone number not registered');
    }

    // Check rate limiting - max 3 requests per 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentOtps = await prisma.otpCode.count({
      where: {
        phoneNumber: normalizedPhone,
        createdAt: { gte: tenMinutesAgo },
      },
    });

    if (recentOtps >= 3) {
      throw new Error('Too many OTP requests. Please try again later');
    }

    // Invalidate previous active OTPs for this phone number (only unused and not expired)
    await prisma.otpCode.updateMany({
      where: {
        phoneNumber: normalizedPhone,
        isUsed: false,
        expiresAt: { gte: new Date() },
      },
      data: {
        isUsed: true,
      },
    });

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiry time
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '5');
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Save OTP to database
    await prisma.otpCode.create({
      data: {
        phoneNumber: normalizedPhone,
        code,
        expiresAt,
      },
    });

    // Send OTP via WhatsApp
    await WhatsAppUtil.sendOtp(normalizedPhone, code);

    return {
      expiresIn: expiryMinutes * 60, // Return in seconds
    };
  }

  /**
   * Verify OTP - Verify OTP code and login/register user
   */
  static async verifyOtp(data: VerifyOtpDto): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    const { phoneNumber, code } = data;

    // Normalize phone number
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

    // Find valid OTP
    const otp = await prisma.otpCode.findFirst({
      where: {
        phoneNumber: normalizedPhone,
        code,
        isUsed: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otp) {
      // Increment attempts for all unused OTPs
      await prisma.otpCode.updateMany({
        where: {
          phoneNumber: normalizedPhone,
          isUsed: false,
          expiresAt: { gte: new Date() },
        },
        data: {
          attempts: { increment: 1 },
        },
      });

      throw new Error('Invalid or expired OTP code');
    }

    // Check max attempts
    const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS || '3');
    if (otp.attempts >= maxAttempts) {
      await prisma.otpCode.update({
        where: { id: otp.id },
        data: { isUsed: true },
      });
      throw new Error('Too many failed attempts. Please request a new OTP');
    }

    // Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { isUsed: true },
    });

    // Find user by phone number
    const user = await prisma.user.findFirst({
      where: {
        phoneNumber: normalizedPhone,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new Error('Phone number not registered');
    }

    // Generate JWT tokens
    const tokens = JwtUtil.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Update refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      dob: formatDate(user.dob),
      phoneNumber: user.phoneNumber,
      role: user.role,
      createdAt: user.createdAt,
    };

    return { user: userResponse, tokens };
  }

  /**
   * Normalize phone number to +62 format
   */
  private static normalizePhoneNumber(phoneNumber: string): string {
    let normalized = phoneNumber.replace(/[\s-]/g, '');

    if (normalized.startsWith('0')) {
      normalized = '+62' + normalized.substring(1);
    } else if (normalized.startsWith('62')) {
      normalized = '+' + normalized;
    } else if (!normalized.startsWith('+')) {
      normalized = '+62' + normalized;
    }

    return normalized;
  }
}
