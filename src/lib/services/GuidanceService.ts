import { DateTime } from 'luxon';
import { AstrologyService } from '../astrology';
import { SMSService } from '../sms';
import { StorageService } from '../storage';
import { OpenAIService } from './OpenAIService';
import { TrialExpiryService } from './TrialExpiryService';
import type { Profile } from '../types/supabase';
import { v4 as uuidv4 } from 'uuid';

export class GuidanceService {
  private static readonly GUIDANCE_TIME = '09:00';
  private static readonly APP_URL = import.meta.env.PROD 
    ? 'https://zodiak.app'
    : 'http://localhost:5173';
  private static isRunning = false;
  private static lastRun: string | null = null;

  private static isSchedulerRunning(): boolean {
    return this.isRunning;
  }

  private static setSchedulerRunning(running: boolean): void {
    this.isRunning = running;
  }

  private static shouldRunGuidance(): boolean {
    const now = DateTime.now();
    const today = now.toISODate();
    const [scheduledHour, scheduledMinute] = this.GUIDANCE_TIME.split(':').map(Number);

    return (
      now.hour === scheduledHour &&
      now.minute === scheduledMinute &&
      this.lastRun !== today
    );
  }

  static async generateAndSendGuidance(profile: Profile): Promise<void> {
    try {
      // Calculate daily transits
      const transits = await AstrologyService.calculateDailyTransits();

      // Generate guidance with OpenAI
      const guidance = await OpenAIService.generateGuidance(
        profile.natal_chart,
        transits
      );

      // Save guidance
      const guidanceData = {
        id: uuidv4(),
        user_id: profile.id,
        date: DateTime.now().toISODate(),
        ...guidance,
        created_at: new Date().toISOString()
      };

      await StorageService.saveDailyGuidance(guidanceData);

      // Format SMS message
      const message = `🌞 ${profile.name}, voici votre guidance du jour :

🌌 ${guidance.summary}

💖 Amour : ${guidance.love}
💼 Travail : ${guidance.work}
🌿 Bien-être : ${guidance.energy}

✨ Découvrez votre guidance complète : ${this.APP_URL}/guidance/${profile.id}`;

      // Send SMS
      await SMSService.sendSMS({
        to: profile.phone,
        message,
        sender: 'Zodiak'
      });

      // Update profile
      await StorageService.saveProfile({
        ...profile,
        last_guidance_sent: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error generating guidance:', error);
      throw error;
    }
  }

  static async startDailyScheduler(): Promise<void> {
    if (this.isSchedulerRunning()) return;

    try {
      const now = DateTime.now();
      const currentHourMinute = now.toFormat('HH:mm');
      const today = now.toISODate();

      const profiles = await StorageService.getAllProfiles();
      const filteredProfiles = profiles.filter((profile: any) =>
        profile.daily_guidance_sms_enabled &&
        profile.guidance_sms_time === currentHourMinute &&
        (!profile.last_guidance_sent || DateTime.fromISO(profile.last_guidance_sent).toISODate() !== today)
      );

      if (filteredProfiles.length > 0) {
        this.setSchedulerRunning(true);
        for (const profile of filteredProfiles) {
          this.generateAndSendGuidance(profile).catch(error => {
            console.error('Error processing guidance for profile:', profile.id, error);
          });
        }
        this.lastRun = today;
      }

      // Start trial expiry notifications
      TrialExpiryService.startExpiryNotifications();
    } catch (error) {
      console.error('Error in guidance scheduler:', error);
    } finally {
      this.setSchedulerRunning(false);
    }
  }
}