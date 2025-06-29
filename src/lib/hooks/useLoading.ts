import { useState, useCallback } from 'react';

export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const setLoadingError = useCallback((error: string) => {
    setError(error);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    error,
    success,
    startLoading,
    stopLoading,
    setLoadingError,
    setSuccess
  };
}