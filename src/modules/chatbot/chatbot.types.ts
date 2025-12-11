import { MessageRole } from '@prisma/client';

// Chatbot-specific types
export interface ChatMessageResponse {
  id: string;
  userId: string; // Required - authentication is mandatory
  role: MessageRole;
  content: string;
  createdAt: Date;
}

export interface ChatHistoryResponse {
  messages: ChatMessageResponse[];
  total: number;
}
