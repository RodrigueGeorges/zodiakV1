import { ApiError } from '../errors';

interface BrevoConfig {
  apiKey: string;
  sender: string;
}

export class BrevoService {
  private static readonly config: BrevoConfig = {
    apiKey: import.meta.env.VITE_BREVO_API_KEY,
    sender: 'Zodiak'
  };

  private static readonly API_URL = 'https://api.brevo.com/v3/transactionalSMS/sms';

  private static checkConfig() {
    if (!this.config.apiKey) {
      throw new ApiError('Clé API Brevo manquante', 'API_ERROR');
    }
  }

  static async sendVerificationSMS(phoneNumber: string, code: string): Promise<void> {
    this.checkConfig();
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.config.apiKey
        },
        body: JSON.stringify({
          sender: this.config.sender,
          recipient: phoneNumber,
          content: `Votre code de vérification Zodiak est : ${code}. Valide pendant 10 minutes.`
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || 'Erreur lors de l\'envoi du SMS de vérification',
          'API_ERROR'
        );
      }
    } catch (error) {
      console.error('Error sending verification SMS:', error);
      throw error instanceof ApiError ? error : new ApiError('Erreur lors de l\'envoi du SMS', 'API_ERROR');
    }
  }

  static async sendDailyGuidanceSMS(phoneNumber: string, guidance: {
    summary: string;
    love: string;
    work: string;
    energy: string;
  }): Promise<void> {
    this.checkConfig();
    try {
      const message = `Votre guidance du jour 🌟\n\n${guidance.summary}\n\n💝 Amour: ${guidance.love}\n💼 Travail: ${guidance.work}\n⚡ Énergie: ${guidance.energy}\n\nZodiak - Votre guide astral quotidien`;

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.config.apiKey
        },
        body: JSON.stringify({
          sender: this.config.sender,
          recipient: phoneNumber,
          content: message
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || 'Erreur lors de l\'envoi du SMS de guidance',
          'API_ERROR'
        );
      }
    } catch (error) {
      console.error('Error sending daily guidance SMS:', error);
      throw error instanceof ApiError ? error : new ApiError('Erreur lors de l\'envoi du SMS de guidance', 'API_ERROR');
    }
  }
} 