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
      const userId = req.user!.userId; // From auth middleware (required)
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
    const userId = req.user!.userId;
    
    // Parse and validate
    const limit = Math.min(
      parseInt(req.query.limit as string) || 50,
      100 // Max 100 messages
    );
    const offset = Math.max(
      parseInt(req.query.offset as string) || 0,
      0 // Min 0
    );
    
    const history = await ChatbotService.getHistory(userId, limit, offset);
    
    return ResponseHandler.success(
      res,
      'Chat history retrieved successfully',
      history
    );
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
      const userId = req.user!.userId; // From auth middleware (required)
      await ChatbotService.clearHistory(userId);
      return ResponseHandler.success(res, 'Chat history cleared successfully');
    } catch (error) {
      next(error);
    }
  }
}
