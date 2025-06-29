import { TrialExpiryService } from '../services/TrialExpiryService';
import { StorageService } from '../storage';
import { SMSService } from '../sms';
import { DateTime } from 'luxon';

jest.mock('../storage');
jest.mock('../sms');

describe('TrialExpiryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockProfile = {
    id: 'test-user',
    name: 'Test User',
    phone: '+33612345678',
    subscription_status: 'trial',
    trial_ends_at: DateTime.now().plus({ hours: 12 }).toISO(),
    birth_date: '1990-01-01',
    birth_time: '12:00',
    birth_place: 'Paris',
    natal_chart: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  it('should send morning notification for expiring trial', async () => {
    // Mock current time to 9 AM
    const mockDate = new Date();
    mockDate.setHours(9, 0, 0, 0);
    jest.setSystemTime(mockDate);

    (StorageService.getAllProfiles as jest.Mock).mockReturnValue([mockProfile]);
    (SMSService.sendSMS as jest.Mock).mockResolvedValue({ success: true });

    TrialExpiryService.startExpiryNotifications();

    // Avancer le temps d'une heure
    jest.advanceTimersByTime(60 * 60 * 1000);

    expect(SMSService.sendSMS).toHaveBeenCalledWith(expect.objectContaining({
      to: mockProfile.phone,
      sender: 'Zodiak'
    }));
  });

  it('should send evening reminder if no subscription', async () => {
    // Mock current time to 6 PM
    const mockDate = new Date();
    mockDate.setHours(18, 0, 0, 0);
    jest.setSystemTime(mockDate);

    (StorageService.getAllProfiles as jest.Mock).mockReturnValue([mockProfile]);
    (SMSService.sendSMS as jest.Mock).mockResolvedValue({ success: true });

    TrialExpiryService.startExpiryNotifications();

    // Avancer le temps d'une heure
    jest.advanceTimersByTime(60 * 60 * 1000);

    expect(SMSService.sendSMS).toHaveBeenCalledWith(expect.objectContaining({
      to: mockProfile.phone,
      sender: 'Zodiak'
    }));
  });

  it('should not send notifications for active subscriptions', async () => {
    const activeProfile = {
      ...mockProfile,
      subscription_status: 'active'
    };

    (StorageService.getAllProfiles as jest.Mock).mockReturnValue([activeProfile]);

    TrialExpiryService.startExpiryNotifications();

    // Avancer le temps d'une journée
    jest.advanceTimersByTime(24 * 60 * 60 * 1000);

    expect(SMSService.sendSMS).not.toHaveBeenCalled();
  });
});