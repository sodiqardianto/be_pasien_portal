/**
 * WhatsApp Utility for sending OTP codes
 * Uses wwebjs service running on localhost:3005
 */

interface WhatsAppConfig {
  provider: string;
  serviceUrl: string;
}

export class WhatsAppUtil {
  private static config: WhatsAppConfig = {
    provider: process.env.WHATSAPP_PROVIDER || 'console',
    serviceUrl: process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3005',
  };

  /**
   * Send WhatsApp message
   */
  static async send(phoneNumber: string, message: string): Promise<void> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

    switch (this.config.provider) {
      case 'console':
        return this.sendViaConsole(normalizedPhone, message);
      case 'wwebjs':
        return this.sendViaWWebJS(normalizedPhone, message);
      default:
        throw new Error(`Unsupported WhatsApp provider: ${this.config.provider}`);
    }
  }

  /**
   * Send OTP code via WhatsApp
   */
  static async sendOtp(phoneNumber: string, code: string): Promise<void> {
    const message = `${code}\n\n*Kode OTP*\nKode ini berlaku selama ${process.env.OTP_EXPIRY_MINUTES || 5} menit. Jangan bagikan kode ini kepada siapapun.`;
    return this.send(phoneNumber, message);
  }

  /**
   * Normalize phone number to international format
   */
  private static normalizePhoneNumber(phoneNumber: string): string {
    // Remove spaces and dashes
    let normalized = phoneNumber.replace(/[\s-]/g, '');

    // Convert to +62 format
    if (normalized.startsWith('0')) {
      normalized = '+62' + normalized.substring(1);
    } else if (normalized.startsWith('62')) {
      normalized = '+' + normalized;
    } else if (!normalized.startsWith('+')) {
      normalized = '+62' + normalized;
    }

    return normalized;
  }

  /**
   * Console provider (for development)
   */
  private static async sendViaConsole(phoneNumber: string, message: string): Promise<void> {
    console.log('\n========================================');
    console.log('� WMhatsApp OTP SENT (Console Mode)');
    console.log('========================================');
    console.log(`To: ${phoneNumber}`);
    console.log(`Message:\n${message}`);
    console.log('========================================\n');
  }

  /**
   * WWebJS provider (using local WhatsApp service)
   */
  private static async sendViaWWebJS(phoneNumber: string, message: string): Promise<void> {
    const { serviceUrl } = this.config;

    try {
      const response = await fetch(`${serviceUrl}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '' })) as { message?: string };
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      await response.json();
      console.log(`✅ WhatsApp message sent successfully to ${phoneNumber}`);
    } catch (error) {
      console.error('Failed to send WhatsApp message via WWebJS:', error);
      
      // Fallback to console in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ WWebJS service unavailable. Falling back to console mode.');
        return this.sendViaConsole(phoneNumber, message);
      }
      
      throw new Error('Failed to send WhatsApp message');
    }
  }
}
