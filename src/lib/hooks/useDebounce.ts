import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value.
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Mettre à jour la valeur "debounced" après le délai spécifié
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Annuler le timeout si la valeur change (l'utilisateur tape encore)
    // ou si le composant est démonté.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Ne ré-exécuter l'effet que si la valeur ou le délai change

  return debouncedValue;
} 