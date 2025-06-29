import { AstrologyService, type BirthData } from '../astrology';
import { StorageService } from '../storage';
import { SMSService } from '../sms';
import { ErrorMessages } from '../errors';
import type { Profile } from '../types/supabase';
import type { Address } from '../address';

interface RegistrationData {
  userId: string;
  name: string;
  birthData: BirthData;
  birthPlace: Address;
}

interface RegistrationResponse {
  success: boolean;
  error?: string;
  profile?: Profile;
}

export class RegistrationWorkflow {
  private static readonly TRIAL_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  static async validateData(data: RegistrationData): Promise<{ valid: boolean; error?: string }> {
    try {
      if (!data.userId) throw new Error('Utilisateur non connecté');
      if (!data.name) throw new Error('Le nom est requis');
      if (!data.birthData.date_of_birth) throw new Error('La date de naissance est requise');
      if (!data.birthData.time_of_birth) throw new Error('L\'heure de naissance est requise');
      if (!data.birthPlace) throw new Error('Le lieu de naissance est requis');

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : ErrorMessages.INVALID_BIRTH_DATA
      };
    }
  }

  static async completeRegistration(data: RegistrationData): Promise<RegistrationResponse> {
    try {
      const validation = await this.validateData(data);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Calculate natal chart
      const natalChart = await AstrologyService.calculateNatalChart(data.birthData);

      // Create profile
      const profile: Profile = {
        id: data.userId,
        name: data.name,
        phone: data.birthPlace.label,
        birth_date: data.birthData.date_of_birth,
        birth_time: data.birthData.time_of_birth,
        birth_place: data.birthPlace.label,
        natal_chart: natalChart,
        trial_ends_at: new Date(Date.now() + this.TRIAL_DURATION).toISOString(),
        subscription_status: 'trial',
        last_guidance_sent: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save profile
      await StorageService.saveProfile(profile);

      // Generate first guidance
      const guidance = await AstrologyService.generateDailyGuidance(
        data.userId,
        natalChart
      );

      // Save guidance
      const guidanceData = {
        id: `guidance_${Date.now()}`,
        user_id: data.userId,
        date: new Date().toISOString().split('T')[0],
        ...guidance,
        created_at: new Date().toISOString()
      };

      await StorageService.saveDailyGuidance(guidanceData);

      // Send welcome SMS
      await SMSService.sendSMS({
        to: data.birthPlace.label,
        message: `✨ Bienvenue sur Zodiak, ${data.name} !

Votre thème natal a été calculé avec succès. Découvrez votre guidance quotidienne sur l'application.

${guidance.summary}`,
        sender: 'Zodiak'
      });

      // Clean up temporary data
      StorageService.clearFormData();

      return { success: true, profile };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'inscription'
      };
    }
  }
}