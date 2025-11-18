import request from 'supertest';

// Mock Prisma
jest.mock('../src/utils/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock PasswordUtil
jest.mock('../src/utils/password', () => ({
  PasswordUtil: {
    hash: jest.fn(),
    compare: jest.fn(),
  },
}));

// Mock JwtUtil
jest.mock('../src/utils/jwt', () => ({
  JwtUtil: {
    generateTokens: jest.fn(),
    verifyRefreshToken: jest.fn(),
  },
}));

import { app } from '../src/index';
import { prisma } from '../src/utils/prisma';
import { PasswordUtil } from '../src/utils/password';
import { JwtUtil } from '../src/utils/jwt';

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;
const mockedPasswordUtil = PasswordUtil as jest.Mocked<typeof PasswordUtil>;
const mockedJwtUtil = JwtUtil as jest.Mocked<typeof JwtUtil>;

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      };

      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (mockedPasswordUtil.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (mockedPrisma.user.create as jest.Mock).mockResolvedValue({
        id: '1',
        email: userData.email,
        name: userData.name,
        password: 'hashedPassword',
        role: 'USER',
        refreshToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      (mockedJwtUtil.generateTokens as jest.Mock).mockReturnValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
      (mockedPrisma.user.update as jest.Mock).mockResolvedValue({} as any);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(mockedPasswordUtil.hash).toHaveBeenCalledWith(userData.password);
      expect(mockedPrisma.user.create).toHaveBeenCalled();
      expect(mockedJwtUtil.generateTokens).toHaveBeenCalled();
    });

    it('should return error if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'Password123',
        name: 'Existing User',
      };

      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: userData.email,
        name: userData.name,
        password: 'hashed',
        role: 'USER',
        refreshToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const user = {
        id: '1',
        email: loginData.email,
        name: 'Test User',
        password: 'hashedPassword',
        role: 'USER',
        refreshToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (mockedPasswordUtil.compare as jest.Mock).mockResolvedValue(true);
      (mockedJwtUtil.generateTokens as jest.Mock).mockReturnValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
      (mockedPrisma.user.update as jest.Mock).mockResolvedValue({} as any);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email },
      });
      expect(mockedPasswordUtil.compare).toHaveBeenCalledWith(loginData.password, user.password);
      expect(mockedJwtUtil.generateTokens).toHaveBeenCalled();
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});