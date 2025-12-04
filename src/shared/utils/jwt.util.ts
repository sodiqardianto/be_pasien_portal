import jwt from 'jsonwebtoken';
import { JwtPayload, AuthTokens } from '../types';

const ACCESS_TOKEN_SECRET = (process.env.ACCESS_TOKEN_SECRET as string) || 'your-access-token-secret-key';
const REFRESH_TOKEN_SECRET = (process.env.REFRESH_TOKEN_SECRET as string) || 'your-refresh-token-secret-key';
const ACCESS_TOKEN_EXPIRY = (process.env.ACCESS_TOKEN_EXPIRY as string) || '15m';
const REFRESH_TOKEN_EXPIRY = (process.env.REFRESH_TOKEN_EXPIRY as string) || '7d';

export class JwtUtil {
  static generateAccessToken(payload: JwtPayload): string {
    return (jwt.sign as any)(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
  }

  static generateRefreshToken(payload: JwtPayload): string {
    return (jwt.sign as any)(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });
  }

  static generateTokens(payload: JwtPayload): AuthTokens {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  static verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  static verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }
}
