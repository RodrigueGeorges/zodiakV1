// ATTENTION: NE PAS MODIFIER CE FICHIER
// Ce fichier définit le workflow de guidance quotidienne

import { AstrologyService } from '../astrology';
import { StorageService } from '../storage';
import { SMSService } from '../sms';
import type { Profile } from '../types/supabase';
import { v4 as uuidv4 } from 'uuid';

// Constantes d'erreur
const ErrorMessages = {
  PROFILE_NOT_FOUND: 'Profil utilisateur non trouvé',
  UNAUTHORIZED: 'Accès non autorisé',
  API_ERROR: 'Erreur lors de la génération de la guidance'
};

// Interface pour la guidance quotidienne
interface DailyGuidance {
  id: string;
  user_id: string;
  date: string;
  summary: string;
  work: string;
  energy: string;
  love: string;
  created_at: string;
}

export class GuidanceWorkflow {
  private static readonly GUIDANCE_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures

  static async validateAccess(userId: string): Promise<{
    valid: boolean;
    error?: string;
    profile?: Profile;
  }> {
    try {
      const profile = StorageService.getProfile(userId);
      if (!profile) {
        throw new Error(ErrorMessages.PROFILE_NOT_FOUND);
      }

      // Vérifier si l'abonnement est valide
      const now = Date.now();
      const trialEnds = new Date(profile.trial_ends_at).getTime();

      if (profile.subscription_status === 'trial' && now > trialEnds) {
        profile.subscription_status = 'expired';
        await StorageService.saveProfile(profile);
        throw new Error('Votre période d\'essai est terminée');
      }

      if (profile.subscription_status === 'expired') {
        throw new Error('Votre abonnement a expiré');
      }

      return { valid: true, profile };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : ErrorMessages.UNAUTHORIZED
      };
    }
  }

  static async getDailyGuidance(userId: string): Promise<{
    success: boolean;
    error?: string;
    guidance?: DailyGuidance;
  }> {
    try {
      const validation = await this.validateAccess(userId);
      if (!validation.valid || !validation.profile) {
        throw new Error(validation.error);
      }

      const today = new Date().toISOString().split('T')[0];
      let guidance = StorageService.getDailyGuidance(userId, today);

      if (!guidance) {
        // Générer une nouvelle guidance
        const newGuidance = await AstrologyService.generateDailyGuidance(
          userId,
          validation.profile.natal_chart
        );

        guidance = {
          id: uuidv4(),
          user_id: userId,
          date: today,
          ...newGuidance,
          created_at: new Date().toISOString()
        };

        await StorageService.saveDailyGuidance(guidance);

        // Envoyer la notification SMS
        await SMSService.sendSMS({
          to: validation.profile.phone,
          message: `🌟 ${validation.profile.name}, voici votre guidance du jour :

${newGuidance.summary}

Découvrez votre guidance complète sur l'application.`,
          sender: 'Zodiak'
        });
      }

      return { success: true, guidance };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : ErrorMessages.API_ERROR
      };
    }
  }
}