export const databaseConfig = {
  url: process.env.DATABASE_URL || '',
  logging: process.env.NODE_ENV === 'development',
} as const;
