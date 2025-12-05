import { MessageRole } from '@prisma/client';
import { prisma } from '../../shared/utils/prisma.util';
import { SendMessageDto } from './chatbot.dto';
import { ChatMessageResponse, ChatHistoryResponse } from './chatbot.types';
import OpenAI from 'openai';

export class ChatbotService {
  private static readonly openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
  });
  private static readonly MODEL = 'deepseek-chat';

  static async sendMessage(
    userId: string | undefined,
    data: SendMessageDto
  ): Promise<ChatMessageResponse> {
    // Simpan pesan user
    await prisma.chatMessage.create({
      data: {
        userId: userId || null,
        role: MessageRole.USER,
        content: data.message,
      },
    });

    // Ambil context dari riwayat chat (5 pesan terakhir)
    const recentMessages = await prisma.chatMessage.findMany({
      where: { userId: userId || null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        role: true,
        content: true,
      },
    });

    // Ambil data rumah sakit untuk context
    const hospitals = await prisma.hospital.findMany({
      where: { deletedAt: null },
      select: {
        name: true,
        description: true,
        phone: true,
        address: true,
        email: true,
        website: true,
      },
    });

    // Buat system prompt dengan data rumah sakit
    const systemPrompt = `Kamu adalah asisten virtual untuk Bethsaida Hospital. Tugasmu adalah membantu pengguna mendapatkan informasi tentang rumah sakit kami.

Data Rumah Sakit:
${hospitals.map((h) => `- ${h.name}: ${h.description}. Alamat: ${h.address}. Telepon: ${h.phone}. Email: ${h.email}${h.website ? `. Website: ${h.website}` : ''}`).join('\n')}

Jawab pertanyaan dengan ramah, informatif, dan profesional. Jika ditanya hal di luar informasi rumah sakit, arahkan kembali ke topik rumah sakit.`;

    // Siapkan messages untuk DeepSeek API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.reverse().map((m) => ({
        role: m.role.toLowerCase(),
        content: m.content,
      })),
    ];

    try {
      // Panggil DeepSeek API menggunakan OpenAI SDK
      const completion = await this.openai.chat.completions.create({
        model: this.MODEL,
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 500,
      });

      const aiResponse = completion.choices[0].message.content || 'Maaf, saya tidak dapat memberikan respons saat ini.';

      // Simpan respons AI
      const assistantMessage = await prisma.chatMessage.create({
        data: {
          userId: userId || null,
          role: MessageRole.ASSISTANT,
          content: aiResponse,
        },
      });

      return assistantMessage;
    } catch (error) {
      console.error('DeepSeek API Error:', error);

      // Fallback response jika API gagal
      const fallbackMessage = await prisma.chatMessage.create({
        data: {
          userId: userId || null,
          role: MessageRole.ASSISTANT,
          content:
            'Maaf, saya sedang mengalami gangguan. Silakan hubungi customer service kami untuk bantuan lebih lanjut.',
        },
      });

      return fallbackMessage;
    }
  }

  static async getHistory(
    userId: string | undefined,
    limit: number = 50,
    offset: number = 0
  ): Promise<ChatHistoryResponse> {
    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { userId: userId || null },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          userId: true,
          role: true,
          content: true,
          createdAt: true,
        },
      }),
      prisma.chatMessage.count({
        where: { userId: userId || null },
      }),
    ]);

    return {
      messages: messages.reverse(), // Reverse untuk urutan chronological
      total,
    };
  }

  static async clearHistory(userId: string): Promise<void> {
    await prisma.chatMessage.deleteMany({
      where: { userId },
    });
  }
}
