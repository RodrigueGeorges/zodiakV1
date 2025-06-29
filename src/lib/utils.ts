import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for combining Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Phone number formatting and validation
export function formatPhoneNumber(value: string): string {
  // Remove all non-digits
  let cleaned = value.replace(/\D/g, '');
  
  // Handle international format
  if (cleaned.startsWith('33')) {
    cleaned = '0' + cleaned.substring(2);
  }
  
  // Limit to 10 digits
  cleaned = cleaned.slice(0, 10);
  
  // Force 06/07 format for French numbers
  if (cleaned.length >= 2) {
    if (cleaned[0] === '0' && !['6', '7'].includes(cleaned[1])) {
      cleaned = '06' + cleaned.slice(2);
    } else if (cleaned[0] !== '0') {
      cleaned = '06' + cleaned.slice(0, 8);
    }
  } else if (cleaned.length === 1 && cleaned[0] !== '0') {
    cleaned = '0' + cleaned;
  }
  
  return cleaned;
}

export function validatePhone(phone: string): boolean {
  // Support both national and international formats
  const cleaned = phone.replace(/\D/g, '');
  
  // French mobile format: 06/07XXXXXXXX or 336/337XXXXXXXX
  return /^(?:0|33)[67]\d{8}$/.test(cleaned);
}

export function formatPhoneNumberForVonage(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Already in international format
  if (cleaned.match(/^33[67]\d{8}$/)) {
    return '+' + cleaned;
  }
  
  // Convert national format to international
  if (cleaned.match(/^0[67]\d{8}$/)) {
    return '+33' + cleaned.substring(1);
  }
  
  throw new Error('Format de numéro invalide. Utilisez le format 06XXXXXXXX ou +33XXXXXXXXX');
}

export function createSafeTimer(callback: () => void, interval: number) {
  let timerId: NodeJS.Timeout | null = null;
  let isActive = false;

  const cleanup = () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    isActive = false;
  };

  const safeCallback = async () => {
    try {
      await callback();
    } catch (error) {
      console.error('Error in timer callback:', error);
      cleanup();
    }
  };

  return {
    start: () => {
      if (!isActive) {
        isActive = true;
        safeCallback();
        timerId = setInterval(safeCallback, interval);
      }
    },
    stop: cleanup,
    isRunning: () => isActive
  };
}