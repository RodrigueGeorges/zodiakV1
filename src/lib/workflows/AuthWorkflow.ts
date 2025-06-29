import { AuthService } from '../auth';
import { StorageService } from '../storage';
import { ErrorMessages } from '../errors';
import { Analytics } from '../monitoring/Analytics';
import type { Profile } from '../types/supabase';

interface AuthResponse {
  success: boolean;
  error?: string;
  profile?: Profile;
}

export class AuthWorkflow {
  private static readonly MAX_ATTEMPTS = 3;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private static readonly ATTEMPTS_KEY = 'auth_attempts';

  private static getAttempts(): { count: number; timestamp: number } {
    try {
      const data = localStorage.getItem(this.ATTEMPTS_KEY);
      return data ? JSON.parse(data) : { count: 0, timestamp: Date.now() };
    } catch {
      return { count: 0, timestamp: Date.now() };
    }
  }

  private static setAttempts(count: number): void {
    localStorage.setItem(this.ATTEMPTS_KEY, JSON.stringify({
      count,
      timestamp: Date.now()
    }));
  }

  private static resetAttempts(): void {
    localStorage.removeItem(this.ATTEMPTS_KEY);
  }

  private static isLockedOut(): boolean {
    const attempts = this.getAttempts();
    if (attempts.count >= this.MAX_ATTEMPTS) {
      const timeElapsed = Date.now() - attempts.timestamp;
      if (timeElapsed < this.LOCKOUT_DURATION) {
        return true;
      }
      this.resetAttempts();
    }
    return false;
  }

  static async signIn(phone: string): Promise<AuthResponse> {
    try {
      if (this.isLockedOut()) {
        throw new Error('Trop de tentatives. Veuillez réessayer plus tard.');
      }

      Analytics.trackEvent('auth', { 
        action: 'sign_in_attempt',
        phone 
      });

      const response = await AuthService.signIn(phone);
      
      if (!response.success) {
        const attempts = this.getAttempts();
        this.setAttempts(attempts.count + 1);
        throw new Error(response.error);
      }

      this.resetAttempts();

      const profile = await StorageService.getProfile(response.session!.user.id);
      
      Analytics.trackEvent('auth', { 
        action: 'sign_in_success',
        userId: response.session!.user.id
      });

      return { success: true, profile };
    } catch (error) {
      Analytics.trackError(error instanceof Error ? error : new Error('Sign in failed'));
      return {
        success: false,
        error: error instanceof Error ? error.message : ErrorMessages.AUTH_ERROR
      };
    }
  }

  static async signOut(): Promise<void> {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (currentUser?.id) {
        StorageService.clearUserData(currentUser.id);
        Analytics.trackEvent('auth', { 
          action: 'sign_out',
          userId: currentUser.id
        });
      }
      await AuthService.signOut();
      this.resetAttempts();
    } catch (error) {
      Analytics.trackError(error instanceof Error ? error : new Error('Sign out failed'));
      throw error;
    }
  }
}