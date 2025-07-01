import { useEffect, useRef } from 'react';
import GuidanceService from '../services/GuidanceService';

export function useGuidanceScheduler() {
  const lastCheckRef = useRef(0);
  const rafIdRef = useRef<number>();

  useEffect(() => {
    const INTERVAL = 60 * 1000; // 1 minute

    const checkGuidance = (timestamp: number) => {
      if (timestamp - lastCheckRef.current >= INTERVAL) {
        try {
          GuidanceService.startDailyScheduler();
          lastCheckRef.current = timestamp;
        } catch (error) {
          console.error('Error in guidance scheduler:', error);
        }
      }
      rafIdRef.current = requestAnimationFrame(checkGuidance);
    };

    // Start the animation frame loop
    rafIdRef.current = requestAnimationFrame(checkGuidance);

    // Cleanup
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);
}