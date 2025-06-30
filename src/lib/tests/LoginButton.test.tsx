import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginButton } from '../../components/LoginButton';
import { SuperAuthService } from '../auth';

jest.mock('../auth');

describe('LoginButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle mobile viewport correctly', () => {
    // Simuler un viewport mobile
    window.innerWidth = 375;
    window.dispatchEvent(new Event('resize'));

    render(<LoginButton />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-xs');
  });

  it('should handle desktop viewport correctly', () => {
    // Simuler un viewport desktop
    window.innerWidth = 1024;
    window.dispatchEvent(new Event('resize'));

    render(<LoginButton />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('sm:text-base');
  });

  it('should handle safe area insets', () => {
    render(<LoginButton />);
    
    const container = screen.getByRole('button').parentElement;
    expect(container).toHaveClass('safe-area-inset-top');
  });
});