export const jwtConfig = {
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'your-access-token-secret-key',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret-key',
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
} as const;
