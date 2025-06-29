import { supabase } from './supabase';
import { validatePhone, formatPhoneNumberForVonage } from './utils';
import type { InboundMessage } from './types/supabase';

interface SMSOptions {
  to: string;
  message: string;
  sender?: string;
}

interface SMSResponse {
  messageId?: string;
  error?: string;
}

export class SMSService {
  private static readonly APP_URL = import.meta.env.PROD 
    ? 'https://zodiak.app'
    : 'http://localhost:5173';

  static async sendSMS(options: SMSOptions): Promise<SMSResponse> {
    try {
      if (!validatePhone(options.to)) {
        throw new Error('Format de numéro invalide');
      }

      const formattedPhone = formatPhoneNumberForVonage(options.to);
      
      // Call Netlify function to send SMS
      const response = await fetch('/.netlify/functions/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formattedPhone,
          text: options.message,
          from: options.sender || 'Zodiak'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi du SMS');
      }

      return { messageId: data.messageId };
    } catch (error) {
      console.error('Send SMS error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Erreur lors de l\'envoi du SMS' 
      };
    }
  }

  static async getInboundMessages(userId: string): Promise<InboundMessage[]> {
    try {
      const { data, error } = await supabase
        .from('inbound_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching inbound messages:', error);
      return [];
    }
  }

  static async sendGuidanceLink(phone: string, userId: string): Promise<SMSResponse> {
    try {
      if (!validatePhone(phone)) {
        throw new Error('Format de numéro invalide');
      }

      const message = `✨ Voici votre guidance Zodiak du jour !

Découvrez votre guidance personnalisée ici :
${this.APP_URL}/guidance/${userId}

🌟 Que les astres vous guident !`;

      return this.sendSMS({
        to: phone,
        message,
        sender: 'Zodiak'
      });
    } catch (error) {
      console.error('Send guidance link error:', error);
      return { error: error instanceof Error ? error.message : 'Erreur lors de l\'envoi du SMS' };
    }
  }
}