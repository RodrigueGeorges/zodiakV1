import { DateTime } from 'luxon';
import { StorageService } from '../storage';
import { SMSService } from '../sms';
import type { Profile } from '../types/supabase';
import { createSafeTimer } from '../utils';

class TrialExpiryService {
  private static readonly MORNING_NOTIFICATION_HOUR = 9;
  private static readonly EVENING_NOTIFICATION_HOUR = 18;
  private static readonly CACHE_KEY = 'trial_expiry_notifications';
  private static readonly APP_URL = import.meta.env.PROD 
    ? 'https://zodiak.app'
    : 'http://localhost:5173';

  private static isSchedulerRunning(): boolean {
    return !!localStorage.getItem(this.CACHE_KEY);
  }

  private static setSchedulerRunning(running: boolean): void {
    if (running) {
      localStorage.setItem(this.CACHE_KEY, 'true');
    } else {
      localStorage.removeItem(this.CACHE_KEY);
    }
  }

  private static async sendExpiryNotification(profile: Profile, isFinal: boolean = false): Promise<void> {
    try {
      const message = isFinal
        ? `🔔 Dernier rappel ! Votre essai Zodiak expire ce soir.
Abonnez-vous maintenant pour continuer à recevoir vos prévisions.
💫 Activez votre abonnement ici : ${this.APP_URL}/subscribe`
        : `🌟 Votre essai gratuit Zodia se termine aujourd'hui !
Continuez à recevoir votre guidance quotidienne pour seulement 7,99 €/mois.
Activez votre abonnement ici : ${this.APP_URL}/subscribe
✨ Restez aligné avec les étoiles !`;

      await SMSService.sendSMS({
        to: profile.phone,
        message,
        sender: 'Zodiak'
      });

      // Marquer la notification comme envoyée
      const notificationKey = `notification_${profile.id}_${isFinal ? 'evening' : 'morning'}`;
      localStorage.setItem(notificationKey, new Date().toISOString());
    } catch (error) {
      console.error('Error sending expiry notification:', error);
    }
  }

  private static hasReceivedNotification(profile: Profile, isFinal: boolean): boolean {
    const notificationKey = `notification_${profile.id}_${isFinal ? 'evening' : 'morning'}`;
    const lastNotification = localStorage.getItem(notificationKey);
    
    if (!lastNotification) return false;

    // Vérifier si la notification a été envoyée aujourd'hui
    const notificationDate = DateTime.fromISO(lastNotification);
    const today = DateTime.now().startOf('day');
    return notificationDate >= today;
  }

  private static isTrialExpiringSoon(profile: Profile): boolean {
    const trialEnd = DateTime.fromISO(profile.trial_ends_at);
    const now = DateTime.now();
    const hoursUntilExpiry = trialEnd.diff(now, 'hours').hours;
    return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0;
  }

  static startExpiryNotifications(): void {
    if (this.isSchedulerRunning()) return;

    const checkAndSendNotifications = async () => {
      const now = DateTime.now();
      const currentHour = now.hour;

      // Vérifier uniquement aux heures spécifiées
      if (currentHour !== this.MORNING_NOTIFICATION_HOUR && 
          currentHour !== this.EVENING_NOTIFICATION_HOUR) {
        return;
      }

      try {
        const profiles = StorageService.getAllProfiles()
          .filter(profile => 
            profile.subscription_status === 'trial' && 
            this.isTrialExpiringSoon(profile)
          );

        for (const profile of profiles) {
          const isFinal = currentHour === this.EVENING_NOTIFICATION_HOUR;
          
          // Vérifier si la notification a déjà été envoyée aujourd'hui
          if (!this.hasReceivedNotification(profile, isFinal)) {
            await this.sendExpiryNotification(profile, isFinal);
          }
        }
      } catch (error) {
        console.error('Error in expiry notification scheduler:', error);
      }
    };

    // Vérifier toutes les minutes
    const timer = createSafeTimer(checkAndSendNotifications, 60 * 1000);
    timer.start();
    this.setSchedulerRunning(true);

    // Vérifier immédiatement au démarrage
    checkAndSendNotifications();
  }
}

export default TrialExpiryService;