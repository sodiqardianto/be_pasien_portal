import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from './auth.controller';
import { registerDto, loginDto, refreshTokenDto, requestOtpDto, verifyOtpDto } from './auth.dto';
import { validate, authenticate } from '../../shared/middleware';

const router = Router();

// Rate limiter for login/register - 5 requests per 10 minutes
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many attempts, please try again later',
    error: 'Rate limit exceeded',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use IP address from request
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
});

// Rate limiter for refresh token - 10 requests per 15 minutes
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many refresh attempts, please try again later',
    error: 'Rate limit exceeded',
  },
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               name:
 *                 type: string
 *                 minLength: 2
 *               dob:
 *                 type: string
 *                 format: date-time
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', authLimiter, validate(registerDto), AuthController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', authLimiter, validate(loginDto), AuthController.login);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post('/refresh-token', refreshLimiter, validate(refreshTokenDto), AuthController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 */
router.get('/profile', authenticate, AuthController.getProfile);

/**
 * @swagger
 * /api/auth/otp/request:
 *   post:
 *     summary: Request OTP code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+6281234567890"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post('/otp/request', authLimiter, validate(requestOtpDto), AuthController.requestOtp);

/**
 * @swagger
 * /api/auth/otp/verify:
 *   post:
 *     summary: Verify OTP code and login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - code
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+6281234567890"
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/otp/verify', authLimiter, validate(verifyOtpDto), AuthController.verifyOtp);

export default router;
