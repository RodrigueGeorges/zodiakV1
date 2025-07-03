import { useRef, useCallback, useEffect } from 'react';

interface PerformanceMetric {
  name: string;
  value?: number;
  unit?: string;
  timestamp: number;
  startTime?: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

interface _CustomPerformanceObserver {
  observe: (target: Element) => void;
  disconnect: () => void;
}

interface _PerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
}

interface UsePerformanceOptions {
  enableLogging?: boolean;
  enableAnalytics?: boolean;
}

export function usePerformance(options: UsePerformanceOptions = {}) {
  const { enableLogging = true, enableAnalytics = true } = options;
  const metricsRef = useRef<Map<string, PerformanceMetric>>(new Map());
  const observersRef = useRef<PerformanceObserver[]>([]);

  const startTimer = useCallback((name: string, metadata?: Record<string, unknown>) => {
    const startTime = performance.now();
    metricsRef.current.set(name, {
      name,
      timestamp: Date.now(),
      startTime,
      metadata
    });

    if (enableLogging) {
      console.log(`🚀 Performance: Started ${name}`, metadata);
    }
  }, [enableLogging]);

  const endTimer = useCallback((name: string, additionalMetadata?: Record<string, unknown>) => {
    const metric = metricsRef.current.get(name);
    if (!metric) {
      console.warn(`Performance metric not found: ${name}`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - (metric.startTime || 0);
    
    metric.endTime = endTime;
    metric.duration = duration;
    
    if (additionalMetadata) {
      metric.metadata = { ...metric.metadata, ...additionalMetadata };
    }

    if (enableLogging) {
      console.log(`✅ Performance: ${name} completed in ${duration.toFixed(2)}ms`, metric.metadata);
    }

    if (enableAnalytics) {
      // Envoyer les métriques aux analytics
      // Analytics.trackPerformance(name, duration, metric.metadata);
    }

    return duration;
  }, [enableLogging, enableAnalytics]);

  const measureAsync = useCallback(async <T>(
    name: string, 
    asyncFunction: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> => {
    startTimer(name, metadata);
    
    try {
      const result = await asyncFunction();
      endTimer(name, { success: true });
      return result;
    } catch (error) {
      endTimer(name, { success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }, [startTimer, endTimer]);

  const getMetrics = useCallback(() => {
    return Array.from(metricsRef.current.values());
  }, []);

  const clearMetrics = useCallback(() => {
    metricsRef.current.clear();
  }, []);

  const getAverageDuration = useCallback((name: string) => {
    const metrics = Array.from(metricsRef.current.values())
      .filter(m => m.name === name && m.duration !== undefined);
    
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return total / metrics.length;
  }, []);

  // Surveiller les métriques de performance du navigateur
  useEffect(() => {
    if (typeof PerformanceObserver !== 'undefined') {
      // Observer les métriques de navigation
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log('🌐 Navigation Performance:', {
              loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              firstPaint: navEntry.responseStart - navEntry.requestStart
            });
          }
        }
      });

      navigationObserver.observe({ entryTypes: ['navigation'] });
      observersRef.current.push(navigationObserver);

      // Observer les métriques de peinture
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint') {
            console.log('🎨 Paint Performance:', {
              name: entry.name,
              startTime: entry.startTime
            });
          }
        }
      });

      paintObserver.observe({ entryTypes: ['paint'] });
      observersRef.current.push(paintObserver);
    }

    return () => {
      observersRef.current.forEach(observer => observer.disconnect());
    };
  }, []);

  return {
    startTimer,
    endTimer,
    measureAsync,
    getMetrics,
    clearMetrics,
    getAverageDuration
  };
} 