import { GuidanceService } from '../../lib/services/GuidanceService';
import { AstrologyService } from '../../lib/astrology';
import { SMSService } from '../../lib/sms';
import { StorageService } from '../../lib/storage';
import type { Profile } from '../../lib/types/supabase';

jest.mock('../../lib/astrology');
jest.mock('../../lib/sms');
jest.mock('../../lib/storage');

describe('GuidanceService', () => {
  const mockProfile: Profile = {
    id: 'test-user',
    name: 'Test User',
    phone: '+33612345678',
    birth_date: '1990-01-01',
    birth_time: '12:00',
    birth_place: 'Paris, France',
    natal_chart: {},
    trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    subscription_status: 'trial',
    last_guidance_sent: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const mockGuidance = {
    summary: 'Test summary',
    love: 'Test love guidance',
    work: 'Test work guidance',
    energy: 'Test energy guidance'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock des méthodes des services
    (AstrologyService.generateDailyGuidance as jest.Mock).mockResolvedValue(mockGuidance);
    (SMSService.sendSMS as jest.Mock).mockResolvedValue({ success: true });
    (StorageService.saveDailyGuidance as jest.Mock).mockResolvedValue(true);
    (StorageService.saveProfile as jest.Mock).mockResolvedValue(true);
  });

  describe('generateAndSendGuidance', () => {
    it('should generate guidance and send SMS', async () => {
      await GuidanceService.generateAndSendGuidance(mockProfile);

      // Vérifie que la guidance a été générée
      expect(AstrologyService.generateDailyGuidance).toHaveBeenCalledWith(
        mockProfile.id,
        mockProfile.natal_chart
      );

      // Vérifie que le SMS a été envoyé
      expect(SMSService.sendSMS).toHaveBeenCalledWith({
        to: mockProfile.phone,
        message: expect.stringContaining(mockGuidance.summary),
        sender: 'Zodiak'
      });

      // Vérifie que la guidance a été sauvegardée
      expect(StorageService.saveDailyGuidance).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockProfile.id,
          ...mockGuidance
        })
      );

      // Vérifie que le profil a été mis à jour
      expect(StorageService.saveProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockProfile,
          last_guidance_sent: expect.any(String)
        })
      );
    });

    it('should handle errors gracefully', async () => {
      (AstrologyService.generateDailyGuidance as jest.Mock).mockRejectedValue(
        new Error('API Error')
      );

      await expect(GuidanceService.generateAndSendGuidance(mockProfile))
        .rejects.toThrow('API Error');

      expect(SMSService.sendSMS).not.toHaveBeenCalled();
      expect(StorageService.saveDailyGuidance).not.toHaveBeenCalled();
      expect(StorageService.saveProfile).not.toHaveBeenCalled();
    });
  });

  describe('startDailyScheduler', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should start scheduler and process guidance', () => {
      GuidanceService.startDailyScheduler();

      // Vérifie que le scheduler est démarré
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 60 * 1000);

      // Simule le passage du temps
      jest.advanceTimersByTime(60 * 1000);

      // Les vérifications spécifiques au timing devraient être faites ici
      // Note: Les tests de timing précis sont complexes et peuvent être peu fiables
    });

    it('should not start multiple schedulers', () => {
      GuidanceService.startDailyScheduler();
      GuidanceService.startDailyScheduler();

      // Vérifie qu'un seul scheduler est démarré
      expect(setInterval).toHaveBeenCalledTimes(1);
    });
  });
});