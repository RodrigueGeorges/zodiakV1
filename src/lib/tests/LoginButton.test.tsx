import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginButton from '../../components/LoginButton';

// Mock des dépendances
vi.mock('../../lib/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    isAuthenticated: false
  })
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    }
  }
}));

describe('LoginButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle mobile viewport correctly', () => {
    // Simuler un viewport mobile
    window.innerWidth = 375;
    window.dispatchEvent(new Event('resize'));

    render(<LoginButton showToast={() => {}} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-xs');
  });

  it('should handle desktop viewport correctly', () => {
    // Simuler un viewport desktop
    window.innerWidth = 1024;
    window.dispatchEvent(new Event('resize'));

    render(<LoginButton showToast={() => {}} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('sm:text-base');
  });

  it('should handle safe area insets', () => {
    render(<LoginButton showToast={() => {}} />);
    
    const container = screen.getByRole('button').parentElement;
    expect(container).toHaveClass('safe-area-inset-top');
  });
});