import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { cn } from '../lib/utils';
import { CosmicLoader } from './CosmicLoader';

interface LoadingScreenProps {
  message?: string;
  error?: string;
  onRetry?: () => void;
}

export function LoadingScreen({ message = 'Chargement...', error, onRetry }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-cosmic-900 text-white">
      <CosmicLoader />
      {message && (
        <div className="mt-6 text-lg text-primary font-semibold text-center animate-pulse" aria-live="polite">
          {message}
        </div>
      )}
      {error && (
        <div className="mt-6 text-lg text-red-400 font-semibold text-center animate-pulse" aria-live="polite">
          {error}
        </div>
      )}
    </div>
  );
}