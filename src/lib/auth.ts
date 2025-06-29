import { supabase } from './supabase';
import { StorageService } from './storage';
import { ErrorMessages } from './errors';
import { validatePhone, formatPhoneNumberForVonage } from './utils';
import { Analytics } from './monitoring/Analytics';

export interface AuthResponse {
  success: boolean;
  error?: string;
  session?: {
    user: {
      id: string;
      phone: string;
    };
  };
}

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
}

type AuthSubscriber = (state: AuthState) => void;

export class AuthService {
  private static subscribers: Set<AuthSubscriber> = new Set();
  private static initialized = false;
  private static readonly SESSION_KEY = 'auth_session';

  private static async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user && !error) {
        this.notifySubscribers(true, session.user.id);
      } else {
        await this.signOut();
      }
    } catch (error) {
      console.error('Error initializing auth service:', error);
      Analytics.trackError(error instanceof Error ? error : new Error('Auth initialization failed'));
    } finally {
      this.initialized = true;
    }
  }

  private static notifySubscribers(isAuthenticated: boolean, userId: string | null): void {
    console.log('Notifying subscribers:', { isAuthenticated, userId });
    this.subscribers.forEach(subscriber => {
      try {
        subscriber({ isAuthenticated, userId });
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    });
  }

  static subscribe(callback: AuthSubscriber): () => void {
    if (!this.initialized) {
      this.initialize();
    }

    this.subscribers.add(callback);
    
    const currentUser = this.getCurrentUser();
    callback({
      isAuthenticated: !!currentUser,
      userId: currentUser?.id || null
    });

    return () => {
      this.subscribers.delete(callback);
    };
  }

  static async signIn(phone: string): Promise<AuthResponse> {
    try {
      // Clean phone number first
      const cleanPhone = phone.replace(/\D/g, '');
      
      // Validate phone format
      if (!validatePhone(cleanPhone)) {
        throw new Error(ErrorMessages.INVALID_PHONE);
      }

      // Format phone for Vonage
      const formattedPhone = formatPhoneNumberForVonage(cleanPhone);
      
      // Track sign in attempt
      Analytics.trackEvent('auth', { 
        action: 'sign_in_attempt', 
        phone: formattedPhone 
      });

      // Call RPC function with formatted phone number
      const { data, error } = await supabase.rpc('rpc_sign_in_with_phone', {
        input_phone: formattedPhone
      });

      // Handle RPC errors
      if (error) {
        console.error('RPC error:', error);
        throw new Error(error.message);
      }

      // Validate RPC response
      if (!data?.user?.id) {
        throw new Error('Invalid response from authentication service');
      }

      // Create session object
      const session = {
        user: {
          id: data.user.id,
          phone: formattedPhone
        }
      };

      // Save session
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      
      // Notify subscribers
      this.notifySubscribers(true, data.user.id);

      // Track successful sign in
      Analytics.trackEvent('auth', { 
        action: 'sign_in_success', 
        userId: data.user.id 
      });

      return {
        success: true,
        session
      };
    } catch (error) {
      console.error('Sign in error:', error);
      
      // Track error with details
      Analytics.trackError(error instanceof Error ? error : new Error('Sign in failed'), {
        phone: phone,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : ErrorMessages.AUTH_ERROR
      };
    }
  }

  static async getCurrentUser(): Promise<{ id: string; phone: string } | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) return null;
      return { id: session.user.id, phone: session.user.phone ?? '' };
    } catch {
      return null;
    }
  }

  static async signOut(): Promise<void> {
    try {
      const currentUser = this.getCurrentUser();
      if (currentUser?.id) {
        StorageService.clearUserData(currentUser.id);
        Analytics.trackEvent('auth', { 
          action: 'sign_out', 
          userId: currentUser.id 
        });
      }

      await supabase.auth.signOut();
      localStorage.removeItem(this.SESSION_KEY);
      this.notifySubscribers(false, null);
    } catch (error) {
      console.error('Error signing out:', error);
      Analytics.trackError(error instanceof Error ? error : new Error('Sign out failed'));
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const isAuth = !!user;
      
      if (!isAuth) {
        await this.signOut();
      }

      this.notifySubscribers(isAuth, user?.id || null);
      return isAuth;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }
}