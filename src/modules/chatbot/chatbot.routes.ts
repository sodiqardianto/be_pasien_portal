import { Router } from 'express';
import { ChatbotController } from './chatbot.controller';
import { sendMessageDto } from './chatbot.dto';
import { validate, authenticate } from '../../shared/middleware';

const router = Router();

/**
 * @swagger
 * /api/chatbot/message:
 *   post:
 *     summary: Send message to chatbot
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     description: Send message to chatbot. Requires authentication.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Apa jam operasional rumah sakit?"
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       401:
 *         description: Unauthorized - Authentication required
 */
router.post('/message', authenticate, validate(sendMessageDto), ChatbotController.sendMessage);

/**
 * @swagger
 * /api/chatbot/history:
 *   get:
 *     summary: Get chat history
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     description: Get chat history. Requires authentication.
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Chat history retrieved successfully
 *       401:
 *         description: Unauthorized - Authentication required
 */
router.get('/history', authenticate, ChatbotController.getHistory);

/**
 * @swagger
 * /api/chatbot/history:
 *   delete:
 *     summary: Clear chat history (requires authentication)
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     description: Clear chat history. Requires authentication - only logged-in users can clear their history.
 *     responses:
 *       200:
 *         description: Chat history cleared successfully
 *       401:
 *         description: Authentication required
 */
router.delete('/history', authenticate, ChatbotController.clearHistory);

export default router;
