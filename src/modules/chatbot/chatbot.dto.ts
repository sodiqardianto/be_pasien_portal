import { z } from 'zod';

// Send Message DTO
export const sendMessageDto = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
});

export type SendMessageDto = z.infer<typeof sendMessageDto>;

// Get History Query DTO
export const getHistoryQueryDto = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('50'),
  offset: z.string().regex(/^\d+$/).transform(Number).optional().default('0'),
});

export type GetHistoryQueryDto = z.infer<typeof getHistoryQueryDto>;
