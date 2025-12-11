import { MessageRole } from '@prisma/client';
import { prisma } from '../../shared/utils/prisma.util';
import { SendMessageDto } from './chatbot.dto';
import { ChatMessageResponse, ChatHistoryResponse } from './chatbot.types';
import OpenAI from 'openai';
import { allTools, executeFunction } from './functions';

export class ChatbotService {
  private static readonly openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
  });
  private static readonly MODEL = 'deepseek-chat';



  static async sendMessage(userId: string, data: SendMessageDto): Promise<ChatMessageResponse> {
    // Validate userId - CRITICAL for security!
    if (!userId || userId.trim() === '') {
      throw new Error('User ID is required to send message');
    }

    // Simpan pesan user
    await prisma.chatMessage.create({
      data: {
        userId: userId,
        role: MessageRole.USER,
        content: data.message,
      },
    });

    // Ambil context dari riwayat chat (5 pesan terakhir)
    const recentMessages = await prisma.chatMessage.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        role: true,
        content: true,
      },
    });

    // System prompt dengan instruksi function calling
    const systemPrompt = `Kamu adalah asisten virtual untuk Bethsaida Hospital. Tugasmu adalah membantu pengguna mendapatkan informasi tentang rumah sakit dan dokter kami.

    **PENTING - Aturan Komunikasi:**
    1. JANGAN pernah menyebutkan istilah teknis seperti "function", "API", "database", "query", "parameter", atau implementasi sistem
    2. JANGAN jelaskan bagaimana kamu mendapatkan informasi (misal: "saya akan query database" atau "saya akan call function")
    3. Jawab seolah-olah kamu langsung tahu informasinya, tanpa menjelaskan prosesnya
    4. Jika user bertanya tentang technical details (function, API, dll), redirect dengan ramah: "Saya dapat membantu Anda dengan informasi rumah sakit dan dokter kami. Ada yang bisa saya bantu hari ini?"

    **Kemampuan Saya:**
    Saya dapat membantu Anda dengan:
    - Mencari dokter berdasarkan nama (contoh: "Apakah ada dokter Yuliana?")
    - Menampilkan daftar dokter yang tersedia di rumah sakit
    - Mencari dokter berdasarkan spesialisasi (contoh: "Cari dokter anak" atau "Dokter spesialis jantung")
    - Memberikan informasi lengkap tentang rumah sakit (alamat, telepon, email, layanan)
    - Menjawab pertanyaan umum tentang layanan dan fasilitas rumah sakit

    **Informasi Penting:**
    Bethsaida Hospital memiliki beberapa lokasi. Ketika user bertanya tentang informasi rumah sakit (alamat, telepon, dll):
    - Jika user TIDAK menyebutkan lokasi spesifik → Gunakan getAllHospitals() atau getHospitalContact() untuk menampilkan semua lokasi
    - Jika user menyebutkan lokasi spesifik (misal: "Gading Serpong", "Serang") → Gunakan getHospitalByLocation() atau getHospitalContact(location)
    - Selalu sebutkan lokasi dalam jawaban untuk clarity

    **Internal Instructions (Jangan disebutkan ke user):**
    
    Doctor Functions:
    - Gunakan searchDoctor(doctorName) ketika user bertanya tentang dokter spesifik
    - Gunakan getActiveDoctors() ketika user ingin melihat daftar dokter
    - Gunakan getDoctorBySpecialization(specialization) ketika user mencari dokter dengan spesialisasi tertentu
    
    Hospital Functions:
    - Gunakan getAllHospitals() ketika user bertanya "Ada rumah sakit apa saja?" atau "Lokasi rumah sakit dimana?"
    - Gunakan getHospitalByLocation(location) ketika user bertanya tentang rumah sakit spesifik (misal: "Info rumah sakit Gading Serpong")
    - Gunakan getHospitalContact() ketika user bertanya "Nomor telepon rumah sakit?" tanpa menyebutkan lokasi
    - Gunakan getHospitalContact(location) ketika user bertanya "Nomor telepon rumah sakit Gading Serpong?"

    Jawab pertanyaan dengan ramah, informatif, dan profesional dalam Bahasa Indonesia. Berikan jawaban yang natural seperti customer service yang berpengalaman.`;

    // Siapkan messages untuk DeepSeek API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.reverse().map((m) => ({
        role: m.role.toLowerCase(),
        content: m.content,
      })),
    ];

    try {
      // Step 1: Send message dengan tools
      const response = await this.openai.chat.completions.create({
        model: this.MODEL,
        messages: messages as any,
        tools: allTools as any,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 500,
      });

      const assistantMessage = response.choices[0].message;

      // Step 2: Check if AI wants to call function
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        console.log('🔧 AI calling functions...');

        // Execute function calls
        const functionResults = [];

        for (const toolCall of assistantMessage.tool_calls) {
          const functionName = (toolCall as any).function.name;
          const functionArgs = JSON.parse((toolCall as any).function.arguments);

          console.log(`   Function: ${functionName}`, functionArgs);

          // Execute function using centralized executor
          const functionResult = await executeFunction(functionName, functionArgs);

          functionResults.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            name: functionName,
            content: JSON.stringify(functionResult),
          });
        }

        // Step 3: Send function results back to AI
        const secondResponse = await this.openai.chat.completions.create({
          model: this.MODEL,
          messages: [...messages, assistantMessage, ...functionResults] as any,
          temperature: 0.7,
          max_tokens: 500,
        });

        const finalAnswer =
          secondResponse.choices[0].message.content ||
          'Maaf, saya tidak dapat memberikan respons saat ini.';

        // Simpan respons AI
        const savedMessage = await prisma.chatMessage.create({
          data: {
            userId: userId,
            role: MessageRole.ASSISTANT,
            content: finalAnswer,
          },
        });

        return savedMessage;
      } else {
        // No function call needed, direct answer
        const aiResponse =
          assistantMessage.content || 'Maaf, saya tidak dapat memberikan respons saat ini.';

        // Simpan respons AI
        const savedMessage = await prisma.chatMessage.create({
          data: {
            userId: userId,
            role: MessageRole.ASSISTANT,
            content: aiResponse,
          },
        });

        return savedMessage;
      }
    } catch (error) {
      console.error('DeepSeek API Error:', error);

      // Fallback response jika API gagal
      const fallbackMessage = await prisma.chatMessage.create({
        data: {
          userId: userId,
          role: MessageRole.ASSISTANT,
          content:
            'Maaf, saya sedang mengalami gangguan. Silakan hubungi customer service kami untuk bantuan lebih lanjut.',
        },
      });

      return fallbackMessage;
    }
  }

  static async getHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ChatHistoryResponse> {
    // Validate userId - CRITICAL for security!
    if (!userId || userId.trim() === '') {
      throw new Error('User ID is required to retrieve chat history');
    }

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { userId: userId },
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
        where: { userId: userId },
      }),
    ]);

    return {
      messages: messages.reverse(), // Reverse untuk urutan chronological
      total,
    };
  }

  static async clearHistory(userId: string): Promise<void> {
    // Validate userId - CRITICAL for security!
    if (!userId || userId.trim() === '') {
      throw new Error('User ID is required to clear chat history');
    }

    await prisma.chatMessage.deleteMany({
      where: { userId },
    });
  }
}
