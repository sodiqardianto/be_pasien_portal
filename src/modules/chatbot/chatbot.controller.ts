import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../../shared/utils/response.util';
import { ChatbotService } from './chatbot.service';

export class ChatbotController {
  static async sendMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const userId = req.user?.userId; // Dari auth middleware, bisa undefined untuk guest
      const response = await ChatbotService.sendMessage(userId, req.body);
      return ResponseHandler.success(res, 'Message sent successfully', response);
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const userId = req.user?.userId;
      const { limit, offset } = req.query as any;
      const history = await ChatbotService.getHistory(userId, limit, offset);
      return ResponseHandler.success(res, 'Chat history retrieved successfully', history);
    } catch (error) {
      next(error);
    }
  }

  static async clearHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return ResponseHandler.unauthorized(res, 'Authentication required to clear history');
      }
      await ChatbotService.clearHistory(userId);
      return ResponseHandler.success(res, 'Chat history cleared successfully');
    } catch (error) {
      next(error);
    }
  }
}
