import { Router } from 'express';
import { ChatbotController } from './chatbot.controller';
import { sendMessageDto } from './chatbot.dto';
import { validate } from '../../shared/middleware';

const router = Router();

/**
 * @swagger
 * /api/chatbot/message:
 *   post:
 *     summary: Send message to chatbot
 *     tags: [Chatbot]
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
 */
router.post('/message', validate(sendMessageDto), ChatbotController.sendMessage);

/**
 * @swagger
 * /api/chatbot/history:
 *   get:
 *     summary: Get chat history
 *     tags: [Chatbot]
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
 */
router.get('/history', ChatbotController.getHistory);

/**
 * @swagger
 * /api/chatbot/history:
 *   delete:
 *     summary: Clear chat history (requires authentication)
 *     tags: [Chatbot]
 *     responses:
 *       200:
 *         description: Chat history cleared successfully
 */
router.delete('/history', ChatbotController.clearHistory);

export default router;
