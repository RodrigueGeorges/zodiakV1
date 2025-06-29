import { useState, useCallback, useEffect } from 'react';
import { Analytics } from '../monitoring/Analytics';
import { toast } from 'react-hot-toast';

interface ErrorInfo {
  message: string;
  code?: string;
  retryable?: boolean;
  timestamp: number;
}

interface UseErrorHandlerOptions {
  showToast?: boolean;
  trackAnalytics?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { 
    showToast = true, 
    trackAnalytics = true, 
    autoRetry = false, 
    maxRetries = 3 
  } = options;
  
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  const handleError = useCallback((
    error: Error | string, 
    context?: string,
    retryFunction?: () => Promise<void>
  ) => {
    const errorInfo: ErrorInfo = {
      message: typeof error === 'string' ? error : error.message,
      code: error instanceof Error ? error.name : undefined,
      retryable: retryFunction !== undefined,
      timestamp: Date.now()
    };

    setErrors(prev => [...prev, errorInfo]);

    // Afficher le toast si activé
    if (showToast) {
      const isRetryable = errorInfo.retryable && retryCount < maxRetries;
      
      if (isRetryable && autoRetry) {
        toast.error(`${errorInfo.message} (Nouvelle tentative...)`);
        handleRetry(retryFunction!);
      } else if (isRetryable) {
        toast.error(`${errorInfo.message} - Utilisez le bouton de rafraîchissement pour réessayer`);
      } else {
        toast.error(errorInfo.message);
      }
    }

    // Tracker l'erreur si activé
    if (trackAnalytics) {
      Analytics.trackError(error instanceof Error ? error : new Error(error), {
        context,
        retryable: errorInfo.retryable,
        retryCount
      });
    }

    console.error('Error handled:', errorInfo, context);
  }, [showToast, trackAnalytics, autoRetry, maxRetries, retryCount]);

  const handleRetry = useCallback(async (retryFunction: () => Promise<void>) => {
    if (retryCount >= maxRetries) {
      toast.error('Nombre maximum de tentatives atteint');
      return;
    }

    setRetryCount(prev => prev + 1);
    
    try {
      await retryFunction();
      setRetryCount(0); // Reset on success
      toast.success('Opération réussie !');
    } catch (error) {
      handleError(
        error instanceof Error ? error : new Error('Erreur lors de la nouvelle tentative'),
        'retry'
      );
    }
  }, [retryCount, maxRetries, handleError]);

  const clearErrors = useCallback(() => {
    setErrors([]);
    setRetryCount(0);
  }, []);

  const getLastError = useCallback(() => {
    return errors[errors.length - 1] || null;
  }, [errors]);

  // Nettoyer les erreurs anciennes (plus de 1 heure)
  useEffect(() => {
    const interval = setInterval(() => {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      setErrors(prev => prev.filter(error => error.timestamp > oneHourAgo));
    }, 5 * 60 * 1000); // Vérifier toutes les 5 minutes

    return () => clearInterval(interval);
  }, []);

  return {
    errors,
    retryCount,
    handleError,
    handleRetry,
    clearErrors,
    getLastError,
    hasErrors: errors.length > 0
  };
} 